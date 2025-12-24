/* ==============================================
 * File:        q-verse-web/app/page.tsx
 * Author:      USDTG GROUP TECHNOLOGY LLC
 * Developer:   Irfan Gedik
 * Created Date: 2025-12-22
 * Last Update:  2025-12-22
 * Version:     1.0.0
 *
 * Description:
 *   Q-Verse Home Page
 *
 *   Main landing page and user registration/dashboard entry point.
 *   Handles user authentication state and routing.
 *
 * License:
 *   MIT License
 * ============================================== */

"use client";

import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";

// ... FeatureCard and StatCard components ...
const FeatureCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="p-8 bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-2xl hover:border-blue-500/50 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 group">
    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{icon}</div>
    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const StatCard = ({ label, value }: { label: string, value: string }) => (
    <div className="text-center">
        <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{value}</div>
        <div className="text-sm text-gray-500 uppercase font-bold tracking-wider">{label}</div>
    </div>
)

export default function Home() {
  const [view, setView] = useState<"landing" | "create" | "dashboard">("landing");
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [status, setStatus] = useState("");

  // API URL logic
  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? "http://localhost:8080" 
    : "/api"; 

  // Session Check
  useEffect(() => {
      const storedUser = localStorage.getItem("qverse_user_data");
      if (storedUser) {
          try {
              const parsed = JSON.parse(storedUser);
              // Verify session is still valid with backend here in real world
              setUserData(parsed);
              setView("dashboard");
          } catch(e) {
              localStorage.removeItem("qverse_user_data");
          }
      }
  }, []);

  const handleCreateAccount = async () => {
    setStatus("Connecting to Quantum Core...");
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        // SUCCESS: Real Data Received
        localStorage.setItem("qverse_user_data", JSON.stringify(data.data));
        setUserData(data.data);
        setView("dashboard");
        // Force reload to update Navbar state (simple way)
        window.location.reload(); 
      } else {
        // ERROR: Backend Error
        setStatus(`Registration Failed: ${data.error || "Unknown Error"}`);
      }
    } catch (e) {
      // NETWORK ERROR
      console.error(e);
      setStatus("❌ Connection Error: Backend is offline. Please start the Core server.");
      // NO DEMO FALLBACK - STRICT REAL DATA POLICY
    }
  };

  const handleLogout = () => {
      localStorage.removeItem("qverse_user_data");
      setUserData(null);
      setView("landing");
      window.location.reload(); // Ensure Navbar updates
  };

  if (view === "dashboard" && userData) {
      return <Dashboard userData={userData} onLogout={handleLogout} API_URL={API_URL} />
  }

  if (view === "create") {
      return (
        <div className="max-w-md mx-auto mt-20 animate-fade-in px-4">
            <div className="bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl border border-gray-700 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              
              <h2 className="text-3xl font-bold mb-2 text-center">Create Identity</h2>
              <p className="text-gray-400 text-center text-sm mb-8">Join the quantum-safe network in seconds.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 focus:border-blue-500 outline-none transition-all text-lg"
                    placeholder="quantum_user"
                  />
                </div>
                <button
                  onClick={handleCreateAccount}
                  disabled={!username || status.includes("Connecting")}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg text-lg"
                >
                  {status && !status.includes("Error") ? "Minting Keys..." : "Generate Wallet 🔑"}
                </button>
                {status && (
                    <div className={`text-center text-sm font-bold p-2 rounded ${status.includes("Error") ? "bg-red-900/20 text-red-400" : "bg-blue-900/20 text-blue-400 animate-pulse"}`}>
                        {status}
                    </div>
                )}
              </div>
            </div>
            <button onClick={() => setView("landing")} className="block mx-auto mt-6 text-gray-500 hover:text-white text-sm transition-colors">← Return Home</button>
          </div>
      )
  }

  // ... rest of the landing page code (same as before) ...
  return (
    <div className="animate-fade-in">
        {/* Mobile App Banner (New) */}
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-xl">📱</span>
                    <span className="text-gray-300 hidden sm:inline">Get the full experience with Q-Verse Mobile.</span>
                    <span className="text-gray-300 sm:hidden">Q-Verse Mobile App Live</span>
                </div>
                <a href="/mobile" className="text-xs font-bold bg-white text-black px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">
                    Download App
                </a>
            </div>
        </div>

        {/* Hero Section */}
        <section className="text-center py-20 md:py-28 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -z-10"></div>
            
            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-900/30 rounded-full border border-blue-800/50 text-sm text-blue-300 mb-8 animate-bounce-slow">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    USDT-gVerse Bridge Now Live
                </div>
                
                <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight mb-8">
                    The Quantum Era <br /> of Finance
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
                    Build, trade, and earn on the world's first NIST-standard quantum-safe blockchain. 
                    Integrating <span className="text-white font-bold">USDT-gVerse</span> for seamless stablecoin liquidity.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={() => setView("create")}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-full font-bold text-lg shadow-lg hover:shadow-blue-500/25 transition-all transform hover:scale-105 active:scale-95"
                    >
                        Launch App 🚀
                    </button>
                    <a href="/ecosystem" className="px-8 py-4 bg-gray-800/80 border border-gray-700 hover:bg-gray-700/80 backdrop-blur-sm rounded-full font-bold text-lg transition-all text-center">
                        Explore Ecosystem 🌐
                    </a>
                </div>
            </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-gray-800/50 bg-gray-900/20">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                <StatCard label="Total Value Locked" value="$450M+" />
                <StatCard label="Transactions" value="12.5M" />
                <StatCard label="Active Wallets" value="85K+" />
                <StatCard label="Avg Block Time" value="400ms" />
            </div>
        </section>

        {/* Features Section */}
        <section className="py-24 max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">Why Q-Verse?</h2>
                <p className="text-gray-400">Built for the next 50 years of computing.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon="🛡️" 
                    title="Quantum Immune" 
                    desc="Secured by Dilithium5 & Kyber algorithms. Your assets are safe from future quantum threats." 
                />
                <FeatureCard 
                    icon="⚡" 
                    title="Atomic Settlement" 
                    desc="Experience instant finality with our high-throughput rust-based engine. No waiting for confirmations." 
                />
                <FeatureCard 
                    icon="💎" 
                    title="RWA & Stablecoins" 
                    desc="Native support for Real World Assets and algorithmic stablecoins like POPEO. Yield generation built-in." 
                />
            </div>
        </section>

        {/* Roadmap */}
        <section className="py-24 bg-gray-900/30">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-4xl font-bold mb-16 text-center">Roadmap</h2>
                <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                    {[
                        { year: "Q1 2025", title: "Mainnet Launch", desc: "Genesis block, QVR Token Generation Event (TGE), and initial validator onboarding." },
                        { year: "Q2 2025", title: "USDT-gVerse Integration", desc: "Cross-chain bridge for USDT assets and liquidity provision incentives." },
                        { year: "Q3 2025", title: "RWA Marketplace", desc: "Launch of real estate and commodities tokenization platform." },
                        { year: "Q4 2025", title: "Quantum DAO", desc: "Full decentralization of governance to the community." }
                    ].map((item, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-blue-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
                                <div className="text-blue-400 font-bold mb-1">{item.year}</div>
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-gray-400 text-sm">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA */}
        <section className="py-24 text-center">
             <div className="max-w-3xl mx-auto px-6">
                 <h2 className="text-4xl font-bold mb-6">Ready to Start?</h2>
                 <p className="text-gray-400 mb-8 text-lg">Join thousands of users securing their financial future today.</p>
                 <button 
                    onClick={() => setView("create")}
                    className="px-10 py-5 bg-white text-black font-bold rounded-full text-lg hover:bg-gray-200 transition-colors shadow-xl hover:shadow-white/20"
                 >
                     Create Wallet
                 </button>
             </div>
        </section>
    </div>
  );
}
