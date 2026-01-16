# 🌱 Crop Disease Doctor - Complete AI System

> **AI-Powered Crop Disease Detection & Advisory System**  
> Computer Vision + RAG + Voice AI + Beautiful Web Interface

![Frontend Preview](frontend_preview.png)

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install all requirements
pip install -r requirements.txt
pip install soundfile  # For audio processing
```

### 2. Start the Application

```powershell
# Simple one-command start
.\start.ps1

# Or manually
python src/app.py
```

### 3. Open Your Browser

Navigate to **`http://127.0.0.1:8000`**

That's it! 🎉

---

## ✨ Features

### 🔬 AI-Powered Analysis
- **Computer Vision**: MobileNetV3-Small model for disease detection
- **RAG Knowledge Base**: Semantic search for treatment advice
- **Voice Recognition**: Whisper AI for Urdu/English transcription
- **Real-time Processing**: Results in under 200ms

### 🎨 Beautiful Frontend
- **Modern Design**: Dark theme with vibrant gradients
- **Responsive**: Works on desktop, tablet, and mobile
- **Interactive**: Smooth animations and transitions
- **Three Modes**: Image upload, text chat, voice queries

### 🛠️ Robust Backend
- **FastAPI**: High-performance async API
- **Persistent Storage**: Vector database with save/load
- **Error Handling**: Comprehensive error messages
- **CORS Enabled**: Ready for frontend integration

---

## 📁 Project Structure

```
RAG/
├── frontend/                    # Web Interface
│   ├── index.html              # Main page
│   ├── style.css               # Premium styling
│   ├── script.js               # Interactive logic
│   └── README.md               # Frontend docs
│
├── src/
│   ├── app.py                  # FastAPI backend server ⭐
│   ├── agents/
│   │   ├── supervisor.py       # Main AI agent with RAG
│   │   └── tools.py            # Vision model inference
│   ├── interfaces/
│   │   └── whisper_bot.py      # Voice transcription
│   ├── memory/
│   │   └── vectordb.py         # Persistent vector DB
│   ├── rag/
│   │   ├── embeddings.py       # Sentence transformers
│   │   └── check_rag.py        # RAG pipeline test
│   └── vision/
│       ├── model.py            # MobileNetV3 classifier
│       ├── train.py            # Training script
│       └── utils.py            # Data utilities
│
├── notebooks/                   # Jupyter notebooks
│   ├── 01_vision_training.ipynb
│   ├── 02_rag_setup.ipynb
│   └── 03_agent_orchestration.ipynb
│
├── data/
│   ├── PlantVillage/           # Training dataset
│   ├── knowledge_base.pkl      # Persistent RAG DB
│   └── audio_sample.wav        # Test audio
│
├── best_model_mobilenet.pt     # Trained model
├── class_index.json            # Class mappings
├── test_all.py                 # Comprehensive tests
├── start.ps1                   # Quick start script
└── requirements.txt            # Dependencies
```

---

## 🎯 Usage Guide

### Option 1: Web Interface (Recommended)

1. **Start the server**: `python src/app.py`
2. **Open browser**: `http://127.0.0.1:8000`
3. **Choose a mode**:
   - 📸 **Image Analysis**: Upload crop photos
   - 💬 **Ask Questions**: Chat with AI
   - 🎤 **Voice Query**: Upload voice notes

### Option 2: API Endpoints

```python
import requests

# Image Analysis
files = {'file': open('crop_image.jpg', 'rb')}
response = requests.post('http://127.0.0.1:8000/analyze/image', files=files)
print(response.json())

# Chat Query
data = {'query': 'How do I treat tomato blight?'}
response = requests.post('http://127.0.0.1:8000/chat', data=data)
print(response.json())

# Voice Query
files = {'file': open('voice_note.wav', 'rb')}
response = requests.post('http://127.0.0.1:8000/analyze/voice', files=files)
print(response.json())
```

### Option 3: Python Code

```python
from src.agents.supervisor import SupervisorAgent

# Initialize
agent = SupervisorAgent()

# Analyze image
result = agent.analyze_crop("path/to/image.jpg")
print(f"Disease: {result['label']}")
print(f"Confidence: {result['confidence']:.2%}")

# Query knowledge base
response = agent.query_knowledge("How to prevent crop diseases?")
for res in response['results']:
    print(f"- {res['metadata']['text']}")
```

---

## 🧪 Testing

Run the comprehensive test suite:

```powershell
python test_all.py
```

Expected output:
```
============================================================
TEST SUMMARY
============================================================
Imports             : [OK] PASS
RAG Pipeline        : [OK] PASS
Persistence         : [OK] PASS
SupervisorAgent     : [OK] PASS

============================================================
ALL TESTS PASSED [OK]
============================================================
```

---

## 🔧 Configuration

### Model Settings

Edit `src/agents/tools.py`:
```python
MODEL_PATH = "best_model_mobilenet.pt"  # Model file
IMG_SIZE = 128                           # Image resolution
```

### Knowledge Base

Edit `src/agents/supervisor.py` to add more disease information in `_initialize_knowledge_base()`.

### API Settings

Edit `src/app.py`:
```python
uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
```

---

## 📊 Performance

| Operation | Time | Hardware |
|-----------|------|----------|
| Vision Inference | ~200ms | CPU (Intel Iris Xe) |
| RAG Query | ~100ms | CPU |
| Voice Transcription | ~2s | CPU (Whisper Small) |
| Total (Image + RAG) | ~300ms | CPU |

---

## 🎓 How It Works

### 1. Image Analysis Pipeline
```
User uploads image
    ↓
MobileNetV3 processes (128x128)
    ↓
Predicts disease class + confidence
    ↓
If disease detected → Query RAG
    ↓
Return diagnosis + treatment advice
```

### 2. RAG Pipeline
```
User asks question
    ↓
Sentence Transformer creates embedding
    ↓
Vector DB searches for similar entries
    ↓
Returns top-k relevant knowledge
    ↓
Display to user
```

### 3. Voice Pipeline
```
User uploads audio
    ↓
Whisper AI transcribes to text
    ↓
Text sent to RAG pipeline
    ↓
Return transcription + answers
```

---

## 🐛 Troubleshooting

### Backend won't start

**Error**: `ModuleNotFoundError`

**Solution**:
```powershell
pip install -r requirements.txt
pip install soundfile
```

### Frontend shows "Backend not running"

**Solution**:
1. Check if backend is running: `http://127.0.0.1:8000/api/health`
2. Start backend: `python src/app.py`
3. Check firewall settings

### Model not found

**Error**: `FileNotFoundError: best_model_mobilenet.pt`

**Solution**:
- Train the model first using `notebooks/01_vision_training.ipynb`
- Or download a pre-trained model

### Low accuracy

**Solution**:
- Use higher quality images
- Ensure good lighting
- Train model with more epochs
- Use larger image size (224x224)

---

## 📚 Documentation

- **Frontend**: See `frontend/README.md`
- **API**: Visit `http://127.0.0.1:8000/docs` when server is running
- **Notebooks**: Check `notebooks/` for detailed examples

---

## 🛣️ Roadmap

### Phase 1: Core Features ✅
- [x] Vision model training
- [x] RAG pipeline
- [x] Voice transcription
- [x] FastAPI backend
- [x] Beautiful frontend

### Phase 2: Enhancements
- [ ] Add more crop diseases (50+)
- [ ] Implement hybrid search (semantic + keyword)
- [ ] Add LLM integration (GPT/Claude)
- [ ] Create mobile app (React Native)

### Phase 3: Production
- [ ] Docker containerization
- [ ] Cloud deployment (AWS/GCP)
- [ ] User authentication
- [ ] Analytics dashboard
- [ ] Multi-language support

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `python test_all.py`
5. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **PlantVillage Dataset**: For training data
- **MobileNetV3**: Efficient vision model
- **Sentence Transformers**: For embeddings
- **Whisper AI**: For voice transcription
- **FastAPI**: For the backend framework

---

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review the documentation in `frontend/README.md`
- Run the test suite: `python test_all.py`

---

**Built with ❤️ using AI, RAG, and Computer Vision**
