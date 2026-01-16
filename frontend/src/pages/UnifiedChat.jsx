import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Mic, Square, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { chatQuery, analyzeImage, analyzeVoice } from '../services/api';
import useAudioRecorder from '../hooks/useAudioRecorder';
import './UnifiedChat.css';

const UnifiedChat = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'assistant',
            content: "Hello! I'm your AI Crop Doctor. I can help you identify plant diseases, provide treatment advice, or answer any agricultural questions. How can I assist you today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const { isRecording, startRecording, stopRecording, audioBlob } = useAudioRecorder();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Greeting detection
    const isGreeting = (text) => {
        const greetings = [
            'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
            'how are you', 'whats up', 'how do you do', 'greetings', 'howdy'
        ];
        const lowerText = text.toLowerCase().trim();
        return greetings.some(g => lowerText.includes(g));
    };

    const getGreetingResponse = () => {
        const responses = [
            "Hello! I'm doing great, thank you! How can I help you with your crops today?",
            "Hi there! I'm here and ready to assist you. What would you like to know about plant health?",
            "Hey! I'm functioning perfectly and excited to help. Do you have any questions about crop diseases?",
            "Greetings! I'm your AI agriculture assistant. How may I help you today?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    };

    const handleSend = async () => {
        if (!input.trim() && !imageFile && !audioBlob) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: input || (imageFile ? '📷 Image uploaded' : '🎤 Voice message'),
            image: imagePreview,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        const userQuery = input;
        setInput('');
        setImagePreview(null);
        const currentImage = imageFile;
        setImageFile(null);
        const currentAudio = audioBlob;

        setIsLoading(true);

        try {
            let response;

            // Handle image
            if (currentImage) {
                response = await analyzeImage(currentImage);
                const assistantMsg = {
                    id: Date.now() + 1,
                    type: 'assistant',
                    content: `**Diagnosis:** ${response.analysis.label}\n\n**Confidence:** ${Math.round(response.analysis.confidence * 100)}%\n\n**Recommended Action:** ${response.analysis.action}`,
                    treatment: response.treatment_advice,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMsg]);
            }
            // Handle voice
            else if (currentAudio) {
                const file = new File([currentAudio], "recording.wav", { type: 'audio/wav' });
                response = await analyzeVoice(file);
                const assistantMsg = {
                    id: Date.now() + 1,
                    type: 'assistant',
                    content: `*You said: "${response.transcription}"*\n\n${response.answers[0]?.text || "I couldn't find relevant information."}`,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMsg]);
            }
            // Handle text (with greeting detection)
            else {
                if (isGreeting(userQuery)) {
                    const assistantMsg = {
                        id: Date.now() + 1,
                        type: 'assistant',
                        content: getGreetingResponse(),
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, assistantMsg]);
                } else {
                    response = await chatQuery(userQuery);
                    const assistantMsg = {
                        id: Date.now() + 1,
                        type: 'assistant',
                        content: response.answers[0]?.text || "I couldn't find relevant information. Could you rephrase your question?",
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, assistantMsg]);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMsg = {
                id: Date.now() + 1,
                type: 'assistant',
                content: "I'm having trouble connecting to the server. Please make sure the backend is running.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleVoiceToggle = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            await startRecording();
        }
    };

    return (
        <div className="unified-chat">
            {/* Header */}
            <header className="chat-header">
                <div className="header-content">
                    <div className="logo-container">
                        <div className="logo-icon">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="logo-text">CropDoctor AI</h1>
                            <p className="logo-subtitle">Intelligent Agriculture Assistant</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Messages Container */}
            <div className="messages-container">
                <div className="messages-wrapper">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`message-row ${msg.type}`}
                            >
                                <div className="message-content-wrapper">
                                    <div className={`message-bubble ${msg.type}`}>
                                        {msg.image && (
                                            <img src={msg.image} alt="Uploaded" className="message-image" />
                                        )}
                                        <div className="message-text">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                        {msg.treatment && msg.treatment.length > 0 && (
                                            <div className="treatment-section">
                                                <h4>Treatment Plan:</h4>
                                                {msg.treatment.map((tip, i) => (
                                                    <div key={i} className="treatment-item">• {tip}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <span className="message-time">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="message-row assistant"
                        >
                            <div className="message-content-wrapper">
                                <div className="message-bubble assistant loading-bubble">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Analyzing...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Container */}
            <div className="input-container">
                <div className="input-wrapper">
                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="image-preview-container">
                            <img src={imagePreview} alt="Preview" className="image-preview" />
                            <button
                                onClick={() => { setImagePreview(null); setImageFile(null); }}
                                className="remove-preview-btn"
                            >×</button>
                        </div>
                    )}

                    <div className="input-box">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            accept="image/*"
                            className="hidden"
                        />

                        {/* Image Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="input-action-btn"
                            title="Upload Image"
                        >
                            <ImageIcon className="w-5 h-5" />
                        </button>

                        {/* Text Input */}
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about crop diseases, treatment, or say hello..."
                            className="text-input"
                            rows="1"
                            disabled={isLoading}
                        />

                        {/* Voice Button */}
                        <button
                            onClick={handleVoiceToggle}
                            className={`input-action-btn ${isRecording ? 'recording' : ''}`}
                            title={isRecording ? "Stop Recording" : "Record Voice"}
                        >
                            {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>

                        {/* Send Button */}
                        <button
                            onClick={handleSend}
                            disabled={isLoading || (!input.trim() && !imageFile && !audioBlob)}
                            className="send-btn"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedChat;
