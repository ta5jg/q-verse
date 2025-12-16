"use client";

import { useState } from "react";

// --- Components ---

const Hero = ({ onJoin }: { onJoin: () => void }) => (
  <section className="text-center py-20 animate-fade-in">
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        The Quantum-Safe Financial Future
      </h1>
      <p className="text-xl text-gray-300">
        Q-Verse is the world's first Hybrid Finance Network secured by NIST-standard Post-Quantum Cryptography.
        Experience instant settlement, zero-knowledge privacy, and asset-backed stability.
      </p>
      <div className="flex gap-4 justify-center pt-8">
        <button 
          onClick={onJoin}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-full font-bold text-lg shadow-lg hover:shadow-blue-500/25 transition-all transform hover:scale-105"
        >
          Launch App 🚀
        </button>
        <button className="px-8 py-4 bg-gray-800 border border-gray-700 hover:bg-gray-700 rounded-full font-bold text-lg transition-all">
          Read Whitepaper 📜
        </button>
      </div>
    </div>
  </section>
);

const FeatureCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl hover:border-blue-500/50 transition-colors">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const Dashboard = ({ userData, onLogout }: { userData: any, onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState("assets");
  const [transferStatus, setTransferStatus] = useState("");
  const [stakeStatus, setStakeStatus] = useState("");

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Welcome back, {userData.user.username} 👋</h2>
          <p className="text-gray-400 text-sm">Wallet ID: {userData.wallet.id}</p>
        </div>
        <button onClick={onLogout} className="text-sm text-red-400 hover:text-red-300">Log Out</button>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Wallet & Balances */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 shadow-xl">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Total Balance</h3>
            <div className="text-4xl font-mono text-white mb-2">$12,450.00</div>
            <div className="text-sm text-green-400 flex items-center gap-1">
              <span>▲ 2.4%</span> <span>(24h)</span>
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">Q</div>
                  <div>
                    <div className="font-bold">QVR</div>
                    <div className="text-xs text-gray-400">Network Token</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono">1,000.00</div>
                  <div className="text-xs text-gray-400">~$500.00</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">$</div>
                  <div>
                    <div className="font-bold">POPEO</div>
                    <div className="text-xs text-gray-400">Stablecoin</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono">5,000.00</div>
                  <div className="text-xs text-gray-400">$5,000.00</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Security Status</h3>
             <div className="flex items-center gap-3 mb-4">
               <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
               <span className="text-green-400 font-semibold">Quantum Secure</span>
             </div>
             <div className="text-xs text-gray-500">
               Your wallet is protected by NIST-standard Dilithium5 cryptography.
             </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Tabs */}
          <div className="flex gap-4 border-b border-gray-700 pb-1">
            {["Send", "Stake", "Swap", "History"].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-4 py-2 text-sm font-bold transition-colors ${
                  activeTab === tab.toLowerCase() ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 min-h-[400px]">
            
            {activeTab === "send" && (
              <div className="max-w-md mx-auto space-y-6 animate-fade-in">
                <h3 className="text-xl font-bold">Send Assets</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Recipient Address</label>
                    <input type="text" placeholder="0x..." className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm focus:border-blue-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Amount</label>
                      <input type="number" placeholder="0.00" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Asset</label>
                      <select className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm focus:border-blue-500 outline-none">
                        <option>QVR</option>
                        <option>POPEO</option>
                      </select>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold">Sign & Send Transaction</button>
                </div>
              </div>
            )}

            {activeTab === "stake" && (
              <div className="max-w-md mx-auto space-y-6 animate-fade-in">
                <div className="text-center mb-8">
                  <div className="text-4xl mb-2">🔒</div>
                  <h3 className="text-xl font-bold">QVR Staking</h3>
                  <p className="text-sm text-gray-400">Earn 5% APY rewards by securing the network.</p>
                </div>
                
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex justify-between items-center mb-6">
                  <div>
                    <div className="text-xs text-gray-400">Currently Staked</div>
                    <div className="text-xl font-mono font-bold text-white">0.00 QVR</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Unclaimed Rewards</div>
                    <div className="text-xl font-mono font-bold text-green-400">+0.00 QVR</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <input type="number" placeholder="Amount to Stake" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm focus:border-blue-500 outline-none" />
                  <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-lg font-bold">Stake Tokens</button>
                </div>
              </div>
            )}

            {/* Placeholders for Swap/History */}
            {(activeTab === "swap" || activeTab === "history") && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-4xl mb-4">🚧</div>
                <p>Module Under Construction</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [view, setView] = useState<"landing" | "create" | "dashboard">("landing");
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [status, setStatus] = useState("");

  const API_URL = "http://localhost:8080"; // Configurable

  const handleCreateAccount = async () => {
    setStatus("Creating Identity...");
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.success) {
        setUserData(data.data);
        setView("dashboard");
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (e) {
      setStatus("Connection Error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="border-b border-gray-800/50 backdrop-blur-md fixed w-full z-50 top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white">Q</div>
            <span className="font-bold text-xl tracking-tight">Q-Verse</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Ecosystem</a>
            <a href="#" className="hover:text-white transition-colors">Developers</a>
            <a href="#" className="hover:text-white transition-colors">Governance</a>
            <a href="#" className="hover:text-white transition-colors">Community</a>
          </div>
          <div>
            {view === "dashboard" ? (
              <div className="text-xs bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2"></span>
                Connected
              </div>
            ) : (
              <button 
                onClick={() => setView("create")}
                className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        
        {view === "landing" && (
          <>
            <Hero onJoin={() => setView("create")} />
            
            <div className="grid md:grid-cols-3 gap-6 mt-20">
              <FeatureCard 
                icon="🛡️" 
                title="Quantum Immune" 
                desc="Built from the ground up with Dilithium5 signatures to resist quantum computer attacks." 
              />
              <FeatureCard 
                icon="⚡" 
                title="Hyper Scalable" 
                desc="Instant finality with atomic settlements. Designed for high-frequency trading and payments." 
              />
              <FeatureCard 
                icon="💎" 
                title="Real Assets" 
                desc="Native support for RWA tokenization, gold-backed stablecoins, and hybrid yield generation." 
              />
            </div>
          </>
        )}

        {view === "create" && (
          <div className="max-w-md mx-auto mt-20 animate-fade-in">
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-center">Create Digital Identity</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Choose Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:border-blue-500 outline-none transition-all"
                    placeholder="quantum_user"
                  />
                </div>
                <button
                  onClick={handleCreateAccount}
                  disabled={!username}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition-all"
                >
                  Generate Quantum Keys 🔑
                </button>
                {status && <div className="text-center text-sm text-yellow-400 animate-pulse">{status}</div>}
              </div>
            </div>
            <button onClick={() => setView("landing")} className="block mx-auto mt-4 text-gray-500 hover:text-white text-sm">← Back</button>
          </div>
        )}

        {view === "dashboard" && userData && (
          <Dashboard userData={userData} onLogout={() => setView("landing")} />
        )}

      </main>
    </div>
  );
}
