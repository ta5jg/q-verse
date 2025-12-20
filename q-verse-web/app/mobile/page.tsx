"use client";

import { useState, useEffect } from "react";

export default function MobilePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [aiInsight, setAiInsight] = useState("Connecting to Q-Mind...");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. PWA Install Handler
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    // 2. Fetch Real AI Data from Backend
    const fetchAI = async () => {
        try {
            // Demo amaçlı mock request, normalde: fetch('/api/ai/analyze'...)
            // Backend şu an compile aşamasında olduğu için simüle ediyoruz ama yapı gerçek.
            await new Promise(r => setTimeout(r, 1500)); 
            const insights = [
                "Analysis: QVR accumulation detected. Trend: Bullish (Risk: Low).",
                "Alert: Large USDT inflow to Q-Verse Bridge. Expect volatility.",
                "Recommendation: Staking APY increased to 5.4%. Good entry point."
            ];
            setAiInsight(insights[Math.floor(Math.random() * insights.length)]);
        } catch (e) {
            setAiInsight("System Offline. Retrying...");
        }
    };
    fetchAI();
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    } else {
        alert("To install: Tap 'Share' icon in your browser and select 'Add to Home Screen'.");
    }
  };

  const handleDownloadAPK = () => {
      // Direct Download Link
      window.location.href = "/downloads/q-verse-v1.0.0.apk";
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 bg-blue-900/30 rounded-full border border-blue-800/50 text-sm text-blue-300 font-bold animate-pulse">
                📲 Live App Available
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                Quantum Finance <br/>
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">In Your Pocket</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
                Manage your QRC-20 assets, track AI-driven market insights, and execute quantum-safe transfers directly from your phone.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                    onClick={handleInstall}
                    className="flex items-center gap-3 bg-white text-black px-6 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors shadow-lg"
                >
                    <div className="text-2xl">📱</div>
                    <div className="text-left leading-tight">
                        <div className="text-[10px] uppercase font-bold text-gray-600">Install PWA</div>
                        <div className="text-sm">iOS & Android</div>
                    </div>
                </button>
                <button 
                    onClick={handleDownloadAPK}
                    className="flex items-center gap-3 bg-transparent border border-gray-600 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors text-white"
                >
                    <div className="text-2xl">🤖</div>
                    <div className="text-left leading-tight">
                        <div className="text-[10px] uppercase font-bold text-gray-400">Direct Download</div>
                        <div className="text-sm">APK (v1.0)</div>
                    </div>
                </button>
            </div>

            <div className="pt-8 border-t border-gray-800 mt-8">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    <span className="text-sm font-bold text-green-400">Q-Mind AI Live Feed</span>
                </div>
                <div className="bg-gray-900/50 border border-gray-700 p-4 rounded-lg font-mono text-sm text-blue-300">
                    &gt; {aiInsight}
                </div>
            </div>
        </div>

        {/* Right Content: Phone Mockup */}
        <div className="relative flex justify-center lg:justify-end">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] -z-10"></div>
            
            {/* Phone Frame */}
            <div className="relative w-[320px] h-[650px] bg-black rounded-[40px] border-8 border-gray-800 shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20"></div>
                
                {/* Screen Content (Simulated App) */}
                <div className="w-full h-full bg-[#0a0a0f] pt-12 px-4">
                    {/* App Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="text-gray-400 text-xs">Total Balance</div>
                            <div className="text-white text-2xl font-bold font-mono">$12,450.00</div>
                        </div>
                        <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mb-8">
                        <div className="flex-1 bg-blue-600 py-3 rounded-xl flex items-center justify-center font-bold text-sm">Send</div>
                        <div className="flex-1 bg-gray-800 py-3 rounded-xl flex items-center justify-center font-bold text-sm">Receive</div>
                    </div>

                    {/* AI Insight Card */}
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-blue-400 font-bold text-xs">Q-Mind AI Insight</span>
                        </div>
                        <p className="text-gray-400 text-xs italic">
                            "{aiInsight}"
                        </p>
                    </div>

                    {/* Asset List */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-900 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold text-xs">Q</div>
                                <div>
                                    <div className="font-bold text-sm">QVR</div>
                                    <div className="text-gray-500 text-[10px]">Q-Verse</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-sm">12,450</div>
                                <div className="text-gray-500 text-[10px]">$5,602.50</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-900 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold text-xs text-black">T</div>
                                <div>
                                    <div className="font-bold text-sm">USDT</div>
                                    <div className="text-gray-500 text-[10px]">Tether</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-sm">1,200</div>
                                <div className="text-gray-500 text-[10px]">$1,200.00</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
