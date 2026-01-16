import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatQuery } from '../services/api';

const Chat = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your AI Crop Doctor. Ask me anything about plant diseases, remedies, or prevention tips.",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = {
            id: Date.now(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatQuery(userMsg.text);

            let botText = "I couldn't find relevant information.";
            if (response.answers && response.answers.length > 0) {
                botText = response.answers[0].text;
            }

            const botMsg = {
                id: Date.now() + 1,
                text: botText,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            const errorMsg = {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting to the server. Please check if the backend is running.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-10 h-screen flex flex-col max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel flex-1 flex flex-col overflow-hidden relative"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                            <Bot className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Crop Assistant</h2>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                RAG Knowledge Base Active
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`
                  max-w-[80%] rounded-2xl px-5 py-3.5 shadow-lg
                  ${msg.sender === 'user'
                                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-tr-none'
                                        : 'bg-slate-800/80 border border-white/10 text-slate-200 rounded-tl-none'
                                    }
                `}>
                                    {msg.sender === 'bot' ? (
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                    )}
                                    <p className={`text-[10px] mt-2 opacity-50 ${msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="bg-slate-800/50 rounded-2xl rounded-tl-none px-4 py-3 border border-white/5 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                                <span className="text-xs text-slate-400 font-medium">Thinking...</span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900/50 border-t border-white/5 backdrop-blur-md">
                    <form onSubmit={handleSend} className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about crop diseases..."
                            className="w-full bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 focus:border-emerald-500 text-slate-200 placeholder-slate-500 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Chat;
