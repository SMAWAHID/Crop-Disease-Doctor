import sys
import os
import shutil
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uvicorn

# Add project root to path to ensure imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.agents.supervisor import SupervisorAgent
from src.interfaces.whisper_bot import transcribe_audio

# Initialize API
app = FastAPI(
    title="Crop Disease Doctor API",
    description="AI-powered backend for crop disease detection and advisory",
    version="1.0.0"
)

# Enable CORS (allow all for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (frontend build)
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
assets_path = os.path.join(frontend_path, "assets")
if os.path.exists(frontend_path) and os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

# Global Agent Instance (Initialized on startup)
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

@app.get("/")
def serve_frontend():
    """Serve the frontend application"""
    frontend_file = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist", "index.html")
    if os.path.exists(frontend_file):
        return FileResponse(frontend_file)
    return {"status": "online", "service": "Crop Disease Doctor", "message": "Frontend build not found. Run 'npm run build' in frontend directory."}

@app.get("/api/health")
def health_check():
    """API health check endpoint"""
    return {"status": "online", "service": "Crop Disease Doctor"}

# --- Endpoints ---

@app.post("/analyze/image")
async def analyze_crop_image(file: UploadFile = File(...)):
    """
    Upload an image for disease detection.
    """
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    # Save temp file
    temp_filename = f"temp_{file.filename}"
    temp_path = os.path.join("..", "data", temp_filename)
    os.makedirs(os.path.join("..", "data"), exist_ok=True)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Analyze
        result = agent.analyze_crop(temp_path)
        
        # Add RAG info if disease detected
        rag_info = []
        if result['label'] != 'PlantVillage':
            query = f"What is {result['label']} and how do I treat it?"
            rag_response = agent.query_knowledge(query, top_k=2)
            rag_info = [res['metadata']['text'] for res in rag_response['results']]
            
        return {
            "analysis": result,
            "treatment_advice": rag_info
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/chat")
async def chat_query(query: str = Form(...)):
    """
    Ask a text question to the RAG knowledge base.
    """
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    try:
        response = agent.query_knowledge(query, top_k=3)
        return {
            "query": query,
            "answers": [
                {
                    "text": res['metadata']['text'],
                    "score": res['score']
                } 
                for res in response['results']
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/voice")
async def analyze_voice(file: UploadFile = File(...)):
    """
    Upload an audio file (wav/ogg/mp3) for transcription and query.
    """
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
        
    temp_filename = f"temp_{file.filename}"
    temp_path = os.path.join("..", "data", temp_filename)
    os.makedirs(os.path.join("..", "data"), exist_ok=True)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 1. Transcribe
        transcribed_text = transcribe_audio(temp_path)
        
        # 2. Query RAG
        rag_response = agent.process_voice_query(transcribed_text)
        
        return {
            "transcription": transcribed_text,
            "answers": [
                {
                    "text": res['metadata']['text'],
                    "score": res['score']
                } 
                for res in rag_response['results']
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    # Run the server
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
