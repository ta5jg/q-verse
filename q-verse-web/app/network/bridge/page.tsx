"use client";

import { useState } from "react";

export default function BridgePage() {
  const [direction, setDirection] = useState("deposit");
  const [selectedChain, setSelectedChain] = useState("Ethereum");
  const [amount, setAmount] = useState("");

  const chains = [
      { name: "Ethereum", tvl: "$450M", status: "Active", color: "from-purple-500 to-indigo-500", icon: "Ξ" },
      { name: "BNB Chain", tvl: "$210M", status: "Active", color: "from-yellow-400 to-yellow-600", icon: "📒" },
      { name: "Solana", tvl: "$125M", status: "Congested", color: "from-purple-400 to-pink-400", icon: "◎" },
      { name: "Tron", tvl: "$850M", status: "Active", color: "from-red-500 to-red-700", icon: "♦" },
      { name: "Avalanche", tvl: "$45M", status: "Active", color: "from-red-400 to-pink-600", icon: "🔺" },
      { name: "Polygon", tvl: "$80M", status: "Active", color: "from-purple-600 to-purple-800", icon: "🟣" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
            <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Universal Liquidity Bridge
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
                Seamlessly transfer assets across 10+ blockchains with zero slippage.
                <br/><span className="text-green-400 font-bold">Total Bridge TVL: $1.85 Billion</span>
            </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Bridge Console */}
            <div className="lg:col-span-1 bg-gray-900/50 border border-gray-800 p-8 rounded-3xl shadow-2xl h-fit">
                <div className="flex bg-gray-800 rounded-xl p-1 mb-8">
                    <button 
                        onClick={() => setDirection("deposit")}
                        className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${direction === "deposit" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                    >
                        Deposit (In)
                    </button>
                    <button 
                        onClick={() => setDirection("withdraw")}
                        className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${direction === "withdraw" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                    >
                        Withdraw (Out)
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">From Network</label>
                        <div className="grid grid-cols-2 gap-2">
                            {chains.slice(0, 4).map(chain => (
                                <button 
                                    key={chain.name}
                                    onClick={() => setSelectedChain(chain.name)}
                                    className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${selectedChain === chain.name ? "bg-blue-900/20 border-blue-500 text-white" : "bg-gray-800 border-transparent text-gray-400 hover:bg-gray-700"}`}
                                >
                                    <span>{chain.icon}</span>
                                    <span className="text-xs font-bold">{chain.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center text-gray-500 text-xl">⬇</div>

                    <div>
                        <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">To Network</label>
                        <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-xl flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">Q</div>
                            <span className="font-bold text-white">Q-Verse Mainnet</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Amount</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                placeholder="0.00" 
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-right font-mono text-white focus:border-blue-500 outline-none" 
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">USDT</div>
                        </div>
                    </div>

                    <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-bold text-lg shadow-lg transition-all">
                        Bridge Assets
                    </button>
                </div>
            </div>

            {/* Network Map / Status */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-gray-900/30 border border-gray-800 p-8 rounded-3xl relative overflow-hidden min-h-[400px]">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                    <h3 className="font-bold text-xl mb-6 relative z-10">Global Liquidity Map</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6 relative z-10">
                        {chains.map((chain, i) => (
                            <div key={i} className="bg-gray-800/80 backdrop-blur border border-gray-700 p-5 rounded-2xl flex items-center justify-between hover:border-blue-500/50 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${chain.color} flex items-center justify-center text-2xl shadow-lg`}>
                                        {chain.icon}
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">{chain.name}</div>
                                        <div className="text-xs text-gray-400">TVL: {chain.tvl}</div>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${chain.status === "Active" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                                    {chain.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
                        <h4 className="font-bold mb-2">Bridge Security</h4>
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Multi-Sig Validators (15/20)
                        </div>
                        <div className="flex items-center gap-2 text-green-400 text-sm mt-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Quantum Proof Signatures
                        </div>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
                        <h4 className="font-bold mb-2">Recent Transactions</h4>
                        <div className="space-y-2 text-xs text-gray-400">
                            <div className="flex justify-between">
                                <span>0x7a...4b2c bridged 5,000 USDT</span>
                                <span className="text-gray-500">2s ago</span>
                            </div>
                            <div className="flex justify-between">
                                <span>0x12...89ef bridged 12 ETH</span>
                                <span className="text-gray-500">15s ago</span>
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
