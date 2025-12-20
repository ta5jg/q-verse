"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the 3D Scene with SSR disabled to prevent 500 Errors
const UniverseScene = dynamic(() => import('./UniverseScene'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-black text-white font-mono">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading Quantum Universe...</p>
        </div>
    </div>
  )
});

export default function UniversePage() {
  return (
    <div className="h-screen w-full bg-black relative">
        {/* UI Overlay */}
        <div className="absolute top-0 left-0 w-full p-8 z-10 flex justify-between items-start pointer-events-none">
            <div>
                <h1 className="text-4xl font-extrabold text-white font-sans drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    Quantum Universe
                </h1>
                <p className="text-blue-300 font-mono text-sm mt-2">v1.0.0 • All Systems Nominal</p>
            </div>
            <div className="pointer-events-auto">
                <Link href="/" className="bg-white/10 backdrop-blur border border-white/20 px-6 py-2 rounded-full text-white font-bold hover:bg-white/20 transition-all">
                    Exit Simulation
                </Link>
            </div>
        </div>

        {/* 3D Canvas Container */}
        <UniverseScene />

        {/* Instructions */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Navigation</p>
            <div className="text-white text-sm font-bold bg-black/50 px-4 py-2 rounded-lg backdrop-blur">
                Drag to Rotate • Click Crystals to Enter Modules
            </div>
        </div>
    </div>
  );
}
