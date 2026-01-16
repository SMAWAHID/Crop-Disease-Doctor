import { Leaf, MessageSquare, Mic, Menu, Map } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'image', label: 'Analysis', icon: Leaf },
        { id: 'chat', label: 'Assistant', icon: MessageSquare },
        { id: 'voice', label: 'Voice Mode', icon: Mic },
        { id: 'world', label: 'World Diagram', icon: Map },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="max-w-6xl mx-auto glass-panel px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Leaf className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
                            Crop<span className="text-emerald-400">Doctor</span>
                        </h1>
                        <p className="text-xs text-slate-400 font-medium tracking-wide">AI DIAGNOSTICS</p>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className="flex bg-slate-800/50 p-1 rounded-xl backdrop-blur-sm border border-white/5">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  relative flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
                  ${isActive ? 'text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Online</span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
