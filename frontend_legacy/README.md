# 🌱 Crop Disease Doctor - Frontend

A beautiful, modern web interface for AI-powered crop disease detection and treatment advice.

## Features

- **📸 Image Analysis**: Upload crop photos for instant disease detection
- **💬 Smart Chat**: Ask questions and get answers from the RAG knowledge base
- **🎤 Voice Queries**: Upload voice notes for transcription and query
- **🎨 Modern Design**: Premium UI with gradients, animations, and responsive layout
- **⚡ Real-time**: Instant results powered by FastAPI backend

## Quick Start

### 1. Start the Backend Server

From the project root directory:

```powershell
# Activate virtual environment
.venv\Scripts\activate

# Start the server
python src/app.py
```

The server will start at `http://127.0.0.1:8000`

### 2. Open the Frontend

Simply navigate to `http://127.0.0.1:8000` in your browser!

The backend automatically serves the frontend at the root URL.

## Alternative: Standalone Frontend

If you want to run the frontend separately (for development):

```powershell
# Install a simple HTTP server (if not already installed)
pip install http.server

# From the frontend directory
cd frontend
python -m http.server 3000
```

Then open `http://localhost:3000` and make sure the backend is running at `http://127.0.0.1:8000`

## Usage

### Image Analysis
1. Click on the "Image Analysis" tab
2. Upload a crop leaf image (drag & drop or click to browse)
3. Click "Analyze Image"
4. View the disease detection results and treatment recommendations

### Chat
1. Click on the "Ask Questions" tab
2. Type your question about crop diseases
3. Press Enter or click "Send"
4. Get instant answers from the knowledge base

### Voice Query
1. Click on the "Voice Query" tab
2. Upload an audio file (WAV, MP3, or OGG)
3. Click "Transcribe & Query"
4. See the transcription and relevant answers

## Technology Stack

- **HTML5**: Semantic structure
- **CSS3**: Modern styling with CSS Grid, Flexbox, animations
- **Vanilla JavaScript**: No frameworks - pure, fast JS
- **FastAPI**: Backend API
- **Fetch API**: For HTTP requests

## Design Features

- 🎨 Modern dark theme with vibrant gradients
- ✨ Smooth animations and transitions
- 📱 Fully responsive (mobile, tablet, desktop)
- ♿ Accessible design
- 🚀 Optimized performance

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Troubleshooting

**Issue**: "Failed to analyze image. Make sure the backend server is running."

**Solution**: 
1. Check if the backend is running at `http://127.0.0.1:8000`
2. Run `python src/app.py` from the project root
3. Check the browser console for errors

**Issue**: CORS errors

**Solution**: The backend is configured to allow all origins in development mode. If you still see CORS errors, make sure you're accessing the frontend through the backend server at `http://127.0.0.1:8000`

## File Structure

```
frontend/
├── index.html      # Main HTML structure
├── style.css       # All styles and animations
├── script.js       # Interactive functionality
└── README.md       # This file
```

## Customization

### Change Colors

Edit the CSS variables in `style.css`:

```css
:root {
    --primary: #10b981;        /* Main green color */
    --secondary: #6366f1;      /* Accent purple */
    --background: #0f172a;     /* Dark background */
    /* ... more variables */
}
```

### Change API URL

Edit `script.js`:

```javascript
const API_BASE_URL = 'http://127.0.0.1:8000';
```

## License

MIT License - Part of the Crop Disease Doctor project
