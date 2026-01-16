// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

// DOM Elements
const imageInput = document.getElementById('image-input');
const uploadArea = document.getElementById('upload-area');
const previewImage = document.getElementById('preview-image');
const analyzeBtn = document.getElementById('analyze-btn');
const imageResult = document.getElementById('image-result');

const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const sendBtn = document.getElementById('send-btn');

const voiceInput = document.getElementById('voice-input');
const voiceUpload = document.getElementById('voice-upload');
const transcribeBtn = document.getElementById('transcribe-btn');
const voiceResult = document.getElementById('voice-result');

const loadingOverlay = document.getElementById('loading-overlay');

// Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update panes
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== Image Analysis =====
uploadArea.addEventListener('click', () => imageInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--border)';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--border)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageSelect(file);
    }
});

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageSelect(file);
    }
});

function handleImageSelect(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewImage.style.display = 'block';
        uploadArea.querySelector('.upload-placeholder').style.display = 'none';
        analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

analyzeBtn.addEventListener('click', async () => {
    const file = imageInput.files[0];
    if (!file) return;
    
    showLoading();
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_BASE_URL}/analyze/image`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Analysis failed');
        
        const data = await response.json();
        displayImageResult(data);
    } catch (error) {
        showError('Failed to analyze image. Make sure the backend server is running.');
        console.error(error);
    } finally {
        hideLoading();
    }
});

function displayImageResult(data) {
    const { analysis, treatment_advice } = data;
    
    let html = `
        <div class="result-header">
            <div>
                <div class="result-label">${analysis.label}</div>
                <div class="result-confidence">Confidence: ${(analysis.confidence * 100).toFixed(1)}%</div>
            </div>
            <div style="font-size: 14px; color: var(--text-muted);">
                Action: ${analysis.action}
            </div>
        </div>
    `;
    
    if (treatment_advice && treatment_advice.length > 0) {
        html += `
            <div class="result-advice">
                <h4>Treatment Recommendations:</h4>
                ${treatment_advice.map(advice => `
                    <div class="advice-item">${advice}</div>
                `).join('')}
            </div>
        `;
    }
    
    imageResult.innerHTML = html;
    imageResult.style.display = 'block';
}

// ===== Chat =====
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const query = chatInput.value.trim();
    if (!query) return;
    
    // Add user message
    addChatMessage(query, 'user');
    chatInput.value = '';
    
    showLoading();
    
    try {
        const formData = new FormData();
        formData.append('query', query);
        
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Chat failed');
        
        const data = await response.json();
        
        // Add bot response
        if (data.answers && data.answers.length > 0) {
            const answer = data.answers[0].text;
            addChatMessage(answer, 'bot');
        } else {
            addChatMessage("I couldn't find relevant information. Please try rephrasing your question.", 'bot');
        }
    } catch (error) {
        addChatMessage('Sorry, I encountered an error. Make sure the backend server is running.', 'bot');
        console.error(error);
    } finally {
        hideLoading();
    }
}

function addChatMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const avatar = sender === 'bot' ? '🤖' : '👤';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <p>${text}</p>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===== Voice =====
voiceUpload.addEventListener('click', () => voiceInput.click());

voiceInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        voiceUpload.querySelector('p').textContent = `Selected: ${file.name}`;
        transcribeBtn.disabled = false;
    }
});

transcribeBtn.addEventListener('click', async () => {
    const file = voiceInput.files[0];
    if (!file) return;
    
    showLoading();
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_BASE_URL}/analyze/voice`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Transcription failed');
        
        const data = await response.json();
        displayVoiceResult(data);
    } catch (error) {
        showError('Failed to process voice. Make sure the backend server is running.');
        console.error(error);
    } finally {
        hideLoading();
    }
});

function displayVoiceResult(data) {
    const { transcription, answers } = data;
    
    let html = `
        <div class="result-header">
            <div>
                <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">Transcription:</div>
                <div class="result-label" style="font-size: 18px;">"${transcription}"</div>
            </div>
        </div>
    `;
    
    if (answers && answers.length > 0) {
        html += `
            <div class="result-advice">
                <h4>Answers:</h4>
                ${answers.map(answer => `
                    <div class="advice-item">
                        ${answer.text}
                        <div style="margin-top: 8px; font-size: 12px; color: var(--text-muted);">
                            Relevance: ${(answer.score * 100).toFixed(1)}%
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    voiceResult.innerHTML = html;
    voiceResult.style.display = 'block';
}

// ===== Utility Functions =====
function showLoading() {
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

function showError(message) {
    alert(message);
}

// Check if backend is running on page load
window.addEventListener('load', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (response.ok) {
            console.log('✓ Backend connected');
        }
    } catch (error) {
        console.warn('⚠ Backend not running. Start it with: python src/app.py');
    }
});
