import React from 'react';
import WorldMap from '../components/WorldMap';

const WorldDiagram = () => {
    return (
        <div className="pt-24 pb-10 min-h-screen max-w-5xl mx-auto px-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6">
                World Diagram
            </h1>
            <WorldMap />
        </div>
    );
};

export default WorldDiagram;
