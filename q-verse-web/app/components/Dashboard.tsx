"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type User = {
  user: {
    username: string;
  };
  wallet: {
    id: string;
  };
};

type Market = {
  id: string;
  name: string;
  price: number;
  // add more fields as needed
};

export default function Dashboard({
  userData,
  onLogout,
  API_URL,
}: {
  userData: User;
  onLogout: () => void;
  API_URL: string;
}) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [marketData, setMarketData] = useState<Market[]>([]);
  const [systemStatus, setSystemStatus] = useState<string>("Online");
  const [tps, setTps] = useState<number>(12450);

  // Asset Metadata
  const assetsList = [
      { id: "QVR", name: "Q-Verse", type: "Native", logo: "/logos/qvr.svg", balance: 12450.00, price: 0.4521, change: "+5.2%" },
      { id: "POPEO", name: "Popeo Stable", type: "Stablecoin", logo: "/logos/popeo.svg", balance: 500.00, price: 1.0002, change: "+0.01%" },
      { id: "RGLS", name: "Regilis", type: "Asset Backed", logo: "/logos/rgls.svg", balance: 100.00, price: 1.0000, change: "+0.1%" },
      { id: "QVRg", name: "QVR-Gold", type: "Commodity", logo: "/logos/qvrg.svg", balance: 5.0, price: 65.40, change: "+1.2%" },
  ];

  const totalPortfolioValue = assetsList.reduce((acc, asset) => acc + (asset.balance * asset.price), 0);

  // Simulate Live Data
  useEffect(() => {
    const interval = setInterval(() => {
        setTps(prev => prev + Math.floor(Math.random() * 50 - 20));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in pb-20 pt-10 px-6 max-w-[1600px] mx-auto">
      {/* Top Bar: User & System Status */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center font-bold text-xl text-white">
                {userData.user.username[0].toUpperCase()}
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">
                    {userData.user.username}
                </h2>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-gray-400 font-mono">{userData.wallet.id}</span>
                </div>
            </div>
        </div>
        
        <div className="flex gap-6 text-sm">
            <div className="text-center">
                <div className="text-gray-500 text-xs font-bold uppercase">Network Status</div>
                <div className="text-green-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span> {systemStatus}
                </div>
            </div>
            <div className="text-center">
                <div className="text-gray-500 text-xs font-bold uppercase">Live TPS</div>
                <div className="text-blue-400 font-mono font-bold">{tps.toLocaleString()}</div>
            </div>
            <div className="text-center">
                <div className="text-gray-500 text-xs font-bold uppercase">Block Height</div>
                <div className="text-white font-mono font-bold">#14,203,401</div>
            </div>
            <button onClick={onLogout} className="px-4 py-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40 transition-colors">
                Logout
            </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Sidebar: Quick Actions */}
        <div className="col-span-12 md:col-span-2 space-y-4">
            {[
                { name: "Overview", icon: "📊", id: "overview" },
                { name: "Wallet", icon: "💼", id: "wallet" },
                { name: "Trade (DEX)", icon: "🔄", link: "/exchange/dex" },
                { name: "Pro Trade (CEX)", icon: "📈", link: "/exchange/cex" },
                { name: "Staking", icon: "🔒", link: "/finance/staking" },
                { name: "Bridge", icon: "🌉", link: "/network/bridge" },
                { name: "Developer IDE", icon: "💻", link: "/dev/ide" },
            ].map((item) => (
                item.link ? (
                    <Link key={item.name} href={item.link} className="flex items-center gap-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all">
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-bold text-sm">{item.name}</span>
                    </Link>
                ) : (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id!)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === item.id ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-bold text-sm">{item.name}</span>
                    </button>
                )
            ))}
        </div>

        {/* Main Content Area */}
        <div className="col-span-12 md:col-span-10">
            
            {activeTab === "overview" && (
                <div className="space-y-6">
                    {/* Portfolio Chart & Stats */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-gray-900/50 p-6 rounded-2xl border border-gray-800 h-80 relative overflow-hidden">
                            <h3 className="text-lg font-bold mb-4">Portfolio Performance</h3>
                            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
                            {/* Mock Chart Line */}
                            <svg className="w-full h-40 mt-10" preserveAspectRatio="none">
                                <path d="M0 100 C 100 80, 200 120, 300 60 S 500 20, 800 10" fill="none" stroke="#3b82f6" strokeWidth="3" />
                            </svg>
                            <div className="absolute top-6 right-6 text-right">
                                <div className="text-3xl font-bold text-white">${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                <div className="text-green-400 font-bold text-sm">+ $1,240.50 (24h)</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700">
                                <div className="text-gray-400 text-xs font-bold uppercase mb-1">Staking Rewards</div>
                                <div className="text-2xl font-bold text-green-400">+125.40 QVR</div>
                                <div className="text-xs text-gray-500 mt-1">Next payout in 4h 20m</div>
                            </div>
                            <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700">
                                <div className="text-gray-400 text-xs font-bold uppercase mb-1">Active Orders</div>
                                <div className="text-2xl font-bold text-white">3</div>
                                <div className="text-xs text-gray-500 mt-1">2 Buy / 1 Sell</div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-5 rounded-2xl border border-purple-500/30">
                                <div className="text-purple-300 text-xs font-bold uppercase mb-1">Q-Mind Insight</div>
                                <div className="text-sm text-gray-300 italic">&quot;RGLS liquidity is rising. Consider increasing your position.&quot;</div>
                            </div>
                        </div>
                    </div>

                    {/* Asset Allocation */}
                    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                        <h3 className="text-lg font-bold mb-4">Your Assets</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {assetsList.map(asset => (
                                <div key={asset.id} className="bg-gray-800 p-4 rounded-xl flex items-center justify-between hover:border-blue-500 border border-transparent transition-all cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-900 p-1 group-hover:scale-110 transition-transform">
                                            <Image src={asset.logo} width={32} height={32} alt={asset.id} />
                                        </div>
                                        <div>
                                            <div className="font-bold">{asset.id}</div>
                                            <div className="text-xs text-gray-400">{asset.type}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold font-mono">{asset.balance.toLocaleString()}</div>
                                        <div className={`text-xs ${asset.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                                            {asset.change}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity Table */}
                    <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="font-bold">Recent Activity</h3>
                            <button className="text-blue-400 text-sm hover:text-white">View All History</button>
                        </div>
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Asset</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {[
                                    { type: "Stake", asset: "QVR", amount: "500.00", status: "Completed", time: "2 mins ago" },
                                    { type: "Swap", asset: "USDT -> RGLS", amount: "100.00", status: "Completed", time: "1 hour ago" },
                                    { type: "Receive", asset: "POPEO", amount: "250.00", status: "Completed", time: "5 hours ago" },
                                ].map((tx, i) => (
                                    <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-white">{tx.type}</td>
                                        <td className="px-6 py-4">{tx.asset}</td>
                                        <td className="px-6 py-4 font-mono">{tx.amount}</td>
                                        <td className="px-6 py-4"><span className="bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs font-bold">{tx.status}</span></td>
                                        <td className="px-6 py-4">{tx.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "wallet" && (
                <div className="text-center py-20 text-gray-500">
                    <div className="text-6xl mb-4">💼</div>
                    <h3 className="text-xl font-bold text-white">Wallet Details</h3>
                    <p>Detailed breakdown of UTXO and addresses coming here.</p>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
