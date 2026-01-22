import sys
import os
import shutil
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.agents.supervisor import SupervisorAgent
from src.interfaces.whisper_bot import transcribe_audio

# -----------------------
# App initialization
# -----------------------

app = FastAPI(
    title="Crop Disease Doctor API",
    description="AI-powered backend for crop disease detection and advisory",
    version="1.0.0"
)

# -----------------------
# CORS
# -----------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# Static frontend
# -----------------------

frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_path):
    assets_path = os.path.join(frontend_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

# -----------------------
# Global agent
# -----------------------

agent: Optional[SupervisorAgent] = None

@app.on_event("startup")
async def startup_event():
    global agent
    print("Initializing Supervisor Agent and Knowledge Base...")
    try:
        agent = SupervisorAgent()
        print("Agent initialized successfully.")
    except Exception as e:
        print(f"Failed to initialize agent: {e}")

# -----------------------
# Serve frontend
# -----------------------

@app.get("/")
def serve_frontend():
    frontend_file = os.path.join(frontend_path, "index.html")
    if os.path.exists(frontend_file):
        return FileResponse(frontend_file)
    return {
        "status": "online",
        "service": "Crop Disease Doctor",
        "message": "Frontend build not found"
    }

# =====================================================
# API ROUTER (THIS IS THE IMPORTANT FIX)
# =====================================================

api = APIRouter(prefix="/api")

@api.get("/health")
def health_check():
    return {"status": "online", "service": "Crop Disease Doctor"}

@api.post("/chat")
async def chat_query(query: str = Form(...)):
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")

    try:
        response = agent.query_knowledge(query, top_k=3)
        return {
            "query": query,
            "answers": [
                {
                    "text": res["metadata"]["text"],
                    "score": res["score"]
                }
                for res in response["results"]
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.post("/analyze/image")
async def analyze_crop_image(file: UploadFile = File(...)):
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")

    temp_dir = os.path.join("..", "data")
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"temp_{file.filename}")

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = agent.analyze_crop(temp_path)

        rag_info = []
        if result["label"] != "PlantVillage":
            query = f"What is {result['label']} and how do I treat it?"
            rag_response = agent.query_knowledge(query, top_k=2)
            rag_info = [res["metadata"]["text"] for res in rag_response["results"]]

        return {
            "analysis": result,
            "treatment_advice": rag_info
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@api.post("/analyze/voice")
async def analyze_voice(file: UploadFile = File(...)):
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")

    temp_dir = os.path.join("..", "data")
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"temp_{file.filename}")

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        transcribed_text = transcribe_audio(temp_path)
        rag_response = agent.process_voice_query(transcribed_text)

        return {
            "transcription": transcribed_text,
            "answers": [
                {
                    "text": res["metadata"]["text"],
                    "score": res["score"]
                }
                for res in rag_response["results"]
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# Register API router
app.include_router(api)

# -----------------------
# Local run
# -----------------------

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000)
