import { useState } from 'react';
import { Mic, StopCircle, Play, FileAudio, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAudioRecorder from '../hooks/useAudioRecorder';
import { analyzeVoice } from '../services/api';

const VoiceQuery = () => {
    const { isRecording, startRecording, stopRecording, audioUrl, audioBlob } = useAudioRecorder();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleAnalyze = async () => {
        if (!audioBlob) return;

        setIsLoading(true);
        setResult(null);
        try {
            const file = new File([audioBlob], "recording.wav", { type: 'audio/wav' });
            const data = await analyzeVoice(file);
            setResult(data);
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Analysis failed. Is the backend running?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-10 min-h-screen flex flex-col max-w-2xl mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-8 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden"
            >
                {/* Background Animation */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

                <div className="relative z-10 space-y-2">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-indigo-400">
                        Voice Diagnosis
                    </h2>
                    <p className="text-slate-400">Describe symptoms or ask questions in Urdu or English</p>
                </div>

                {/* Recorder Circle */}
                <div className="relative">
                    {isRecording && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-20 transform scale-150"></span>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-20 delay-150 transform scale-125"></span>
                        </div>
                    )}

                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`
              relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl
              ${isRecording
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                                : 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:scale-105 shadow-emerald-500/30'
                            }
            `}
                    >
                        {isRecording ? (
                            <StopCircle className="w-10 h-10 text-white" />
                        ) : (
                            <Mic className="w-10 h-10 text-white" />
                        )}
                    </button>
                </div>

                {/* Status / Visualizer */}
                <div className="h-12 flex items-center justify-center gap-1">
                    {isRecording ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-1.5 bg-red-400 rounded-full"
                                animate={{
                                    height: [10, 32, 10],
                                    opacity: [0.5, 1, 0.5]
                                }}
                                transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    delay: i * 0.1
                                }}
                            />
                        ))
                    ) : (
                        !audioUrl && <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Ready to Record</span>
                    )}
                </div>

                {/* Action Area */}
                <AnimatePresence>
                    {audioUrl && !isRecording && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="w-full max-w-sm space-y-4"
                        >
                            <audio src={audioUrl} controls className="w-full h-10 opacity-80" />

                            <button
                                onClick={handleAnalyze}
                                disabled={isLoading}
                                className="w-full btn btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing Audio...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Analyze Recording
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Results */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 glass-panel p-6 space-y-4"
                    >
                        <div className="space-y-1">
                            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Transcription</span>
                            <p className="text-lg text-emerald-100 font-medium italic">"{result.transcription}"</p>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/10">
                            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">AI Advice</span>
                            {result.answers.map((ans, i) => (
                                <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                                    <p className="text-slate-300 leading-relaxed">{ans.text}</p>
                                    <div className="mt-2 flex items-center justify-end">
                                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/20">
                                            {Math.round(ans.score * 100)}% Match
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VoiceQuery;
