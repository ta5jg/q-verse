"use client";

import { useState, useEffect } from "react";

export default function SystemStatusPage() {
    const [networkStatus, setNetworkStatus] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([
        "> Initializing Q-VM...",
        "> Loading Crystals-Kyber keys...",
        "> Connecting to P2P Mesh Network...",
        "> Syncing Block #12,450,230...",
    ]);
    const [isoStatus, setIsoStatus] = useState("WAITING");

    useEffect(() => {
        // Simulate real-time logs
        const interval = setInterval(() => {
            const msgs = [
                "> [P2P] Peer 12D3... connected (Latency: 45ms)",
                "> [Consensus] Block verified by 15 validators",
                "> [Mempool] 150 txs pending",
                "> [VM] Contract 0x8a... executed successfully (Gas: 4500)",
                "> [Compliance] ISO 20022 message parsed: pain.001"
            ];
            const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
            setLogs(prev => [...prev.slice(-8), randomMsg]);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const runISOCheck = async () => {
        setIsoStatus("CHECKING");
        // Simulate API call
        setTimeout(() => setIsoStatus("PASSED"), 1500);
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-6 bg-[#050505]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                        System Core Status
                    </h1>
                    <p className="text-gray-400">Real-time monitoring of Q-Verse nodes, VM engine, and compliance modules.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* P2P Network Map */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                        <h2 className="font-bold text-xl mb-6 flex items-center gap-3">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                            Global P2P Mesh (libp2p)
                        </h2>
                        
                        {/* Visualization Mock */}
                        <div className="relative h-64 w-full bg-black rounded-xl overflow-hidden mb-4 border border-gray-800">
                             {/* Central Node */}
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.8)] z-10"></div>
                             
                             {/* Peers */}
                             {[...Array(8)].map((_, i) => (
                                 <div key={i} className="absolute w-2 h-2 bg-gray-500 rounded-full animate-pulse" 
                                      style={{
                                          top: `${50 + 30 * Math.sin(i * 0.8)}%`,
                                          left: `${50 + 30 * Math.cos(i * 0.8)}%`,
                                      }}>
                                      {/* Line to center */}
                                      <div className="absolute top-1 left-1 h-[1px] bg-gray-800 origin-top-left" style={{
                                          width: '100px', 
                                          transform: `rotate(${i * 45 + 180}deg)`,
                                          opacity: 0.3
                                      }}></div>
                                 </div>
                             ))}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-gray-800 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 font-bold uppercase">Peers</div>
                                <div className="font-mono font-bold text-lg">1,240</div>
                            </div>
                            <div className="bg-gray-800 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 font-bold uppercase">Protocol</div>
                                <div className="font-mono text-blue-400 text-sm">GossipSub v1.1</div>
                            </div>
                             <div className="bg-gray-800 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 font-bold uppercase">Uptime</div>
                                <div className="font-mono text-green-400 text-sm">99.99%</div>
                            </div>
                        </div>
                    </div>

                    {/* Terminal / Logs */}
                    <div className="bg-[#0a0a0f] border border-gray-800 rounded-2xl p-6 font-mono text-sm flex flex-col">
                         <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                             <span className="font-bold text-gray-400">Node Terminal</span>
                             <span className="text-xs bg-gray-800 px-2 py-1 rounded">v0.2.0-alpha</span>
                         </div>
                         <div className="flex-1 space-y-2 overflow-hidden">
                             {logs.map((log, i) => (
                                 <div key={i} className={`truncate ${log.includes("Error") ? "text-red-500" : "text-green-400/80"}`}>
                                     {log}
                                 </div>
                             ))}
                         </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mt-8">
                     {/* VM Status */}
                     <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                         <h3 className="font-bold mb-4">Q-VM (WASM Engine)</h3>
                         <div className="space-y-4">
                             <div className="flex justify-between text-sm">
                                 <span className="text-gray-500">Engine</span>
                                 <span>Wasmer 4.2 (Cranelift)</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                 <span className="text-gray-500">Status</span>
                                 <span className="text-green-400 font-bold">RUNNING</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                 <span className="text-gray-500">Memory</span>
                                 <span>128 MB / 4 GB</span>
                             </div>
                             <button className="w-full mt-2 py-2 bg-gray-800 hover:bg-gray-700 rounded text-xs font-bold border border-gray-700">
                                 Execute Test Contract
                             </button>
                         </div>
                     </div>

                     {/* Compliance Check */}
                     <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                         <h3 className="font-bold mb-4">Banking Compliance</h3>
                         <div className="flex items-center justify-between mb-4">
                             <span className="text-sm text-gray-400">ISO 20022 Parser</span>
                             <span className={`text-xs font-bold px-2 py-1 rounded ${isoStatus === "PASSED" ? "bg-green-900 text-green-400" : "bg-yellow-900 text-yellow-400"}`}>
                                 {isoStatus}
                             </span>
                         </div>
                         <div className="p-3 bg-black/50 rounded-lg text-[10px] text-gray-500 font-mono mb-4 break-all">
                             &lt;Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001..."&gt;
                         </div>
                         <button 
                            onClick={runISOCheck}
                            className="w-full py-2 bg-blue-900/50 hover:bg-blue-900 rounded text-xs font-bold border border-blue-800 text-blue-300"
                         >
                             Run Verification Test
                         </button>
                     </div>

                     {/* Security */}
                     <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                         <h3 className="font-bold mb-4">Quantum Shield</h3>
                         <div className="space-y-4">
                             <div className="flex items-center gap-3">
                                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                 <span className="text-sm text-gray-300">Dilithium5 Signatures</span>
                             </div>
                             <div className="flex items-center gap-3">
                                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                 <span className="text-sm text-gray-300">Kyber Key Exchange</span>
                             </div>
                             <div className="flex items-center gap-3">
                                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                 <span className="text-sm text-gray-300">Noise Protocol (P2P)</span>
                             </div>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
}
