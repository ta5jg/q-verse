"use client";

import Image from "next/image";

export default function OraclesPage() {
    const feeds = [
        { pair: "QVR / USD", price: "$0.4521", status: "Active", updated: "1s ago", logo: "/logos/qvr.svg", isLocal: true },
        { pair: "RGLS / USD", price: "$1.0000", status: "Active", updated: "1s ago", logo: "/logos/rgls.svg", isLocal: true },
        { pair: "POPEO / USD", price: "$1.0000", status: "Active", updated: "1s ago", logo: "/logos/popeo.svg", isLocal: true, description: "Stablecoin pegged to $1.00" },
        { pair: "QVRt / USD", price: "$0.1250", status: "Active", updated: "1s ago", logo: "/logos/qvrt.svg", isLocal: true, description: "Treasury & Testing Token" },
        { pair: "QVRg / Gold", price: "$65.40", status: "Active", updated: "5m ago", logo: "/logos/qvrg.svg", isLocal: true },
        { pair: "BTC / USD", price: "$98,420.50", status: "Active", updated: "2s ago", logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=024", isExternal: true },
        { pair: "ETH / USD", price: "$4,120.12", status: "Active", updated: "2s ago", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024", isExternal: true },
    ];

    return (
      <div className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Decentralized Oracle Network</h1>
                <p className="text-gray-400">Real-time, quantum-verified price feeds.</p>
            </div>
  
            <div className="grid md:grid-cols-3 gap-6">
                {feeds.map((feed, i) => (
                    <div key={i} className="bg-gray-800/30 border border-gray-700 p-6 rounded-xl hover:border-blue-500/50 transition-colors">
                        <div className="flex justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {feed.isLocal ? 
                                    <Image src={feed.logo} width={32} height={32} alt="logo" /> :
                                    <img src={feed.logo} width={32} height={32} alt="logo" />
                                }
                                <h3 className="font-bold">{feed.pair}</h3>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded font-bold ${feed.status === "Active" ? "bg-green-900/30 text-green-400" : "bg-gray-700 text-gray-400"}`}>
                                {feed.status}
                            </span>
                        </div>
                        <div className="text-2xl font-mono font-bold text-white mb-2">{feed.price}</div>
                        <div className="text-xs text-gray-500">Last updated: {feed.updated}</div>
                        {feed.description && (
                            <div className="text-xs text-gray-400 mt-2 italic">{feed.description}</div>
                        )}
                        
                        <div className="mt-4 pt-4 border-t border-gray-700/50 flex gap-2">
                            <div className="w-full h-1 bg-gray-700 rounded overflow-hidden">
                                <div className="h-full bg-green-500 w-[99%]"></div>
                            </div>
                        </div>
                        <div className="text-[10px] text-right text-gray-500 mt-1">99.9% Uptime</div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }
