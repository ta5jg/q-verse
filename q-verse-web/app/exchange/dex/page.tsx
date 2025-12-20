"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { apiMethods } from "@/lib/api";
import { useRealtimePrice } from "@/hooks/useRealtime";
import LoadingSpinner from "@/components/LoadingSpinner";

// Token Definitions with Logos
const tokens = [
    { id: "QVR", name: "Q-Verse", logo: "/logos/qvr.svg", isLocal: true },
    { id: "USDT", name: "Tether", logo: "https://cryptologos.cc/logos/tether-usdt-logo.svg?v=024", isLocal: false },
    { id: "RGLS", name: "Regilis", logo: "/logos/rgls.svg", isLocal: true },
    { id: "QVRg", name: "QVR Gold", logo: "/logos/qvrg.svg", isLocal: true },
    { id: "QVRt", name: "QVR Time", logo: "/logos/qvrt.svg", isLocal: true },
    { id: "POPEO", name: "Popeo Stable", logo: "/logos/popeo.svg", isLocal: true },
    { id: "ETH", name: "Ethereum", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024", isLocal: false },
];

export default function DEXPage() {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10"></div>
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Swap</h1>
                <div className="flex gap-2 text-gray-400">
                    <button className="hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors">⚙️</button>
                </div>
            </div>

            {/* From Input */}
            <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 mb-2">
                <div className="flex justify-between mb-2 text-sm text-gray-400">
                    <span>From</span>
                    <span>Balance: 1,240.50</span>
                </div>
                <div className="flex items-center gap-4">
                    <input 
                        type="number" 
                        placeholder="0.0" 
                        value={fromAmount}
                        onChange={e => setFromAmount(e.target.value)}
                        className="bg-transparent text-3xl font-mono text-white outline-none w-full" 
                    />
                    <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-xl border border-gray-700">
                        {fromToken.isLocal ? (
                            <Image src={fromToken.logo} width={24} height={24} alt={fromToken.id} />
                        ) : (
                            <img src={fromToken.logo} width={24} height={24} alt={fromToken.id} />
                        )}
                        <select 
                            value={fromToken.id}
                            onChange={e => setFromToken(tokens.find(t => t.id === e.target.value) || tokens[0])}
                            className="bg-transparent text-white font-bold outline-none"
                        >
                            {tokens.map(t => <option key={t.id} value={t.id}>{t.id}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center -my-4 relative z-10">
                <button className="bg-gray-800 border border-gray-700 p-2 rounded-xl hover:bg-gray-700 hover:border-blue-500 hover:text-blue-400 transition-all shadow-lg">
                    ⬇
                </button>
            </div>

            {/* To Input */}
            <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 mt-2 mb-6">
                <div className="flex justify-between mb-2 text-sm text-gray-400">
                    <span>To</span>
                    <span>Balance: 0.00</span>
                </div>
                <div className="flex items-center gap-4">
                    <input 
                        type="number" 
                        placeholder="0.0" 
                        value={toAmount}
                        readOnly
                        className="bg-transparent text-3xl font-mono text-white outline-none w-full" 
                    />
                    <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-xl border border-gray-700">
                        {toToken.isLocal ? (
                            <Image src={toToken.logo} width={24} height={24} alt={toToken.id} />
                        ) : (
                            <img src={toToken.logo} width={24} height={24} alt={toToken.id} />
                        )}
                        <select 
                            value={toToken.id}
                            onChange={e => setToToken(tokens.find(t => t.id === e.target.value) || tokens[1])}
                            className="bg-transparent text-white font-bold outline-none"
                        >
                            {tokens.map(t => <option key={t.id} value={t.id}>{t.id}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/20 transition-all transform active:scale-95">
                Swap
            </button>
        </div>
      </div>
    </div>
  );
}
