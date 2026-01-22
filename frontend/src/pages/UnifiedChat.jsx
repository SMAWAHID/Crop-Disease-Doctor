import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Mic, Square, Loader2, Sparkles, Plus, MessageSquare, Trash2, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { chatQuery, analyzeImage, analyzeVoice } from '../services/api';
import useAudioRecorder from '../hooks/useAudioRecorder';
import './UnifiedChat.css';

const UnifiedChat = () => {
    const [chatSessions, setChatSessions] = useState(() => {
        const saved = localStorage.getItem('chatSessions');
        return saved ? JSON.parse(saved) : [{
            id: Date.now(),
            title: 'New Chat',
            messages: [{
                id: 1,
                type: 'assistant',
                content: "Hello! I'm your AI Crop Doctor specialized in agriculture. I can help you identify plant diseases, provide treatment advice, or answer agricultural questions. How can I assist you today?",
                timestamp: new Date()
            }],
            createdAt: new Date()
        }];
    });

    const [currentSessionId, setCurrentSessionId] = useState(chatSessions[0].id);
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        // Always open on desktop, closed on mobile
        return window.innerWidth > 768;
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const { isRecording, startRecording, stopRecording, audioBlob, clearAudio } = useAudioRecorder();

    const currentSession = chatSessions.find(s => s.id === currentSessionId) || chatSessions[0];

    useEffect(() => {
        localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }, [chatSessions]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentSession?.messages]);

    // Handle responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-send voice message when recording stops and blob is available
    useEffect(() => {
        if (audioBlob && !isRecording) {
            // Small delay to ensure state is ready
            const timer = setTimeout(() => {
                handleSend();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [audioBlob, isRecording]);

    const createNewChat = () => {
        const newSession = {
            id: Date.now(),
            title: 'New Chat',
            messages: [{
                id: Date.now(),
                type: 'assistant',
                content: "Hello! I'm your AI Crop Doctor specialized in agriculture. How can I help you today?",
                timestamp: new Date()
            }],
            createdAt: new Date()
        };
        setChatSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
    };

    const deleteChat = (sessionId) => {
        if (chatSessions.length === 1) return; // Don't delete last chat
        setChatSessions(prev => prev.filter(s => s.id !== sessionId));
        if (currentSessionId === sessionId) {
            setCurrentSessionId(chatSessions[0].id);
        }
    };

    const updateSessionTitle = (sessionId, firstMessage) => {
        setChatSessions(prev => prev.map(session =>
            session.id === sessionId
                ? { ...session, title: firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '') }
                : session
        ));
    };

    const isAgricultureRelated = (text) => {
        const agKeywords = [
            // Core terms
            'crop', 'plant', 'farm', 'agriculture', 'garden',
            // Plant parts
            'leaf', 'leaves', 'root', 'stem', 'flower', 'fruit', 'seed', 'branch',
            // Issues & conditions
            'disease', 'pest', 'weed', 'rot', 'blight', 'mold', 'fungus', 'bacteria', 'virus',
            'wilt', 'spot', 'yellow', 'brown', 'red', 'black', 'white', 'dry', 'wet',
            // Farming
            'soil', 'fertilizer', 'compost', 'irrigation', 'water', 'harvest', 'grow', 'prune',
            // Specific crops
            'tomato', 'wheat', 'rice', 'corn', 'potato', 'bean', 'lettuce', 'carrot',
            'vegetable', 'herb', 'tree', 'grass', 'shrub',
            // Insects & pests
            'insect', 'bug', 'aphid', 'caterpillar', 'beetle', 'mite', 'worm',
            // General agriculture
            'cultivation', 'horticulture', 'greenhouse', 'field', 'organic'
        ];
        const lowerText = text.toLowerCase();
        // More lenient - if it contains ANY agriculture keyword, allow it
        return agKeywords.some(keyword => lowerText.includes(keyword));
    };

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
            "Hello! I'm doing great, thank you! I'm here to help with your agricultural questions. What would you like to know about crop health?",
            "Hi there! I'm functioning perfectly and ready to assist you with farming and plant disease questions. How can I help?",
            "Hey! I'm your specialized agriculture AI assistant. Feel free to ask me about crops, diseases, or farming practices!"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    };

    const getNonAgricultureResponse = () => {
        return "I appreciate your question, but I'm specifically designed to help with **agriculture and crop-related queries only**. I specialize in:\n\n• Plant disease identification\n• Treatment recommendations  \n• Crop health advice\n• Farming best practices\n\nPlease ask me something related to agriculture, and I'll be happy to help! 🌱";
    };

    const handleSend = async () => {
        if (!input.trim() && !imageFile && !audioBlob) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: input || (imageFile ? '📷 Image uploaded' : '🎤 Voice message'),
            image: imagePreview,
            timestamp: new Date()
        };

        // Update session with user message
        setChatSessions(prev => prev.map(session =>
            session.id === currentSessionId
                ? {
                    ...session,
                    messages: [...session.messages, userMessage],
                    title: session.messages.length === 1 ? (input.slice(0, 30) + (input.length > 30 ? '...' : '')) : session.title
                }
                : session
        ));

        const userQuery = input;
        setInput('');
        setImagePreview(null);
        const currentImage = imageFile;
        setImageFile(null);
        const currentAudio = audioBlob;
        // Clear audioBlob to prevent re-sending
        if (currentAudio) {
            clearAudio();
        }

        setIsLoading(true);

        try {
            let assistantContent = '';
            let treatment = null;

            if (currentImage) {
                const response = await analyzeImage(currentImage);
                assistantContent = `**Diagnosis:** ${response.analysis.label}\n\n**Confidence:** ${Math.round(response.analysis.confidence * 100)}%\n\n**Recommended Action:** ${response.analysis.action}`;
                treatment = response.treatment_advice;
            } else if (currentAudio) {
                const file = new File([currentAudio], "recording.wav", { type: 'audio/wav' });
                const response = await analyzeVoice(file);

                // Check if transcribed text is agriculture-related
                if (!isAgricultureRelated(response.transcription) && !isGreeting(response.transcription)) {
                    assistantContent = getNonAgricultureResponse();
                } else if (isGreeting(response.transcription)) {
                    assistantContent = getGreetingResponse();
                } else {
                    assistantContent = `*You said: "${response.transcription}"*\n\n${response.answers[0]?.text || "I couldn't find relevant information."}`;
                }
            } else {
                // Text query with agriculture check
                if (isGreeting(userQuery)) {
                    assistantContent = getGreetingResponse();
                } else if (!isAgricultureRelated(userQuery)) {
                    assistantContent = getNonAgricultureResponse();
                } else {
                    const response = await chatQuery(userQuery);
                    assistantContent = response.answers[0]?.text || "I couldn't find relevant information. Could you rephrase your question about crops or plant diseases?";
                }
            }

            const assistantMsg = {
                id: Date.now() + 1,
                type: 'assistant',
                content: assistantContent,
                treatment: treatment,
                timestamp: new Date()
            };

            setChatSessions(prev => prev.map(session =>
                session.id === currentSessionId
                    ? { ...session, messages: [...session.messages, assistantMsg] }
                    : session
            ));

        } catch (error) {
            console.error('Error:', error);
            const errorMsg = {
                id: Date.now() + 1,
                type: 'assistant',
                content: "I'm having trouble connecting to the server. Please make sure the backend is running.",
                timestamp: new Date()
            };
            setChatSessions(prev => prev.map(session =>
                session.id === currentSessionId
                    ? { ...session, messages: [...session.messages, errorMsg] }
                    : session
            ));
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
            // The useEffect will auto-send when audioBlob is set
        } else {
            await startRecording();
        }
    };

    return (
        <div className="unified-chat">
            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="sidebar"
                    >
                        <div className="sidebar-header">
                            <button onClick={createNewChat} className="new-chat-btn">
                                <Plus className="w-4 h-4" />
                                New Chat
                            </button>
                            <button onClick={() => setSidebarOpen(false)} className="close-sidebar-btn">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="chat-list">
                            {chatSessions.map(session => (
                                <div
                                    key={session.id}
                                    className={`chat-item ${session.id === currentSessionId ? 'active' : ''}`}
                                    onClick={() => setCurrentSessionId(session.id)}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="chat-title">{session.title}</span>
                                    {chatSessions.length > 1 && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteChat(session.id); }}
                                            className="delete-chat-btn"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Chat */}
            <div className="main-chat">
                {/* Header */}
                <header className="chat-header">
                    <div className="header-content">
                        {!sidebarOpen && (
                            <button onClick={() => setSidebarOpen(true)} className="menu-btn">
                                <Menu className="w-5 h-5" />
                            </button>
                        )}
                        <div className="logo-container">
                            <div className="logo-icon">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="logo-text">CropDoctor AI</h1>
                                <p className="logo-subtitle">Agriculture Specialist</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Messages Container */}
                <div className="messages-container">
                    <div className="messages-wrapper">
                        <AnimatePresence initial={false}>
                            {currentSession.messages.map((msg) => (
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
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="input-action-btn"
                                title="Upload Image"
                            >
                                <ImageIcon className="w-5 h-5" />
                            </button>

                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about crop diseases, treatment, or say hello..."
                                className="text-input"
                                rows="1"
                                disabled={isLoading}
                            />

                            <button
                                onClick={handleVoiceToggle}
                                className={`input-action-btn ${isRecording ? 'recording' : ''}`}
                                title={isRecording ? "Stop Recording" : "Record Voice"}
                            >
                                {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>

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
        </div>
    );
};

export default UnifiedChat;
