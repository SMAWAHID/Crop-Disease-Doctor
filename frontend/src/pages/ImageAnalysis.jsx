import { useState, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeImage } from '../services/api';

const ImageAnalysis = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        if (file.type.startsWith('image/')) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setIsLoading(true);
        try {
            const data = await analyzeImage(image);
            setResult(data);
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Analysis failed. Check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const clearImage = () => {
        setImage(null);
        setPreview(null);
        setResult(null);
    };

    return (
        <div className="pt-24 pb-10 min-h-screen max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Upload Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
            >
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                        Smart Diagnostics
                    </h1>
                    <p className="text-slate-400 leading-relaxed max-w-md">
                        Upload a photo of your crop to instantly identify diseases and receive expert treatment plans.
                    </p>
                </div>

                <div className="glass-panel p-2 transition-all duration-300 hover:shadow-emerald-500/10 hover:border-emerald-500/30">
                    <div
                        className={`
              relative w-full h-80 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer overflow-hidden
              ${isDragging
                                ? 'border-emerald-500 bg-emerald-500/10'
                                : preview
                                    ? 'border-transparent bg-slate-900'
                                    : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/50'
                            }
            `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        {preview ? (
                            <>
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-full object-contain p-2"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); clearImage(); }}
                                        className="p-3 bg-red-500/20 hover:bg-red-500 rounded-full text-red-500 hover:text-white transition-all border border-red-500/30"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={handleChange}
                                />
                                <div className="flex flex-col items-center gap-4 text-slate-400 group-hover:text-emerald-400 transition-colors pointer-events-none">
                                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium">Click or drag image here</p>
                                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">JPG, PNG up to 10MB</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={!image || isLoading}
                    className={`
            w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all
            ${!image
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-emerald-500/30 hover:translate-y-[-2px] active:translate-y-[1px]'
                        }
          `}
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Analyze Crop
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </motion.div>

            {/* Results Section */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* Diagnosis Card */}
                        <div className="glass-panel p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <LeafPattern className="w-40 h-40 text-emerald-500" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    {result.analysis.label === 'Healthy' ? (
                                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                                    ) : (
                                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                                    )}
                                    <div>
                                        <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Diagnosis</p>
                                        <h2 className="text-2xl font-bold text-white">{result.analysis.label}</h2>
                                    </div>
                                </div>

                                <div className="flex gap-4 mb-6">
                                    <div className="bg-slate-800/60 rounded-lg px-4 py-2 border border-white/5">
                                        <p className="text-xs text-slate-400">Confidence</p>
                                        <p className="text-lg font-mono font-bold text-emerald-400">
                                            {Math.round(result.analysis.confidence * 100)}%
                                        </p>
                                    </div>
                                    <div className="bg-slate-800/60 rounded-lg px-4 py-2 border border-white/5">
                                        <p className="text-xs text-slate-400">Action Required</p>
                                        <p className="text-lg font-bold text-white max-w-[150px] truncate">
                                            {result.analysis.action}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Treatment Plan */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                                <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                                Treatment Plan
                            </h3>

                            {result.treatment_advice && result.treatment_advice.length > 0 ? (
                                result.treatment_advice.map((advice, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-slate-800/50 p-5 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-colors"
                                    >
                                        <p className="text-slate-300 leading-relaxed text-sm">{advice}</p>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-slate-500 italic p-4 text-center">No specific treatment advice available.</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Simple visual decoration
const LeafPattern = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

export default ImageAnalysis;
