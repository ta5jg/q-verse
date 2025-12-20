"use client";

import Image from "next/image";

export default function CEXPage() {
  const pairs = [
      { pair: "QVR/USDT", price: "0.4521", change: "+5.2%", logo: "/logos/qvr.svg" },
      { pair: "RGLS/USDT", price: "1.0000", change: "+0.1%", logo: "/logos/rgls.svg" },
      { pair: "QVRg/USDT", price: "65.40", change: "+1.2%", logo: "/logos/qvrg.svg" },
      { pair: "BTC/USDT", price: "98,240", change: "-1.2%", isExternal: true, logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=024" },
      { pair: "ETH/USDT", price: "4,120", change: "+0.5%", isExternal: true, logo: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024" },
  ];

  return (
    <div className="min-h-screen pt-20 px-2 flex flex-col h-screen">
      <div className="flex-1 grid grid-cols-12 gap-1 pb-2">
        
        {/* Left Sidebar: Pairs */}
        <div className="hidden md:block col-span-2 bg-gray-900/50 border border-gray-800 rounded-lg p-2 overflow-y-auto">
            <div className="flex gap-2 mb-4 border-b border-gray-800 pb-2">
                <button className="text-xs font-bold text-blue-400 bg-blue-900/20 px-2 py-1 rounded">Favorites</button>
                <button className="text-xs font-bold text-gray-400 hover:text-white px-2 py-1">Q-Assets</button>
            </div>
            <div className="space-y-1">
                {pairs.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-2 hover:bg-gray-800 rounded cursor-pointer group">
                        <div className="flex items-center gap-2">
                            {item.isExternal ? 
                                <img src={item.logo} width={16} height={16} alt="logo" /> :
                                <Image src={item.logo} width={16} height={16} alt="logo" />
                            }
                            <div className="text-xs font-bold text-gray-300 group-hover:text-white">{item.pair}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-mono text-white">{item.price}</div>
                            <div className={`text-[10px] ${item.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}>{item.change}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Center: Chart & Order Book */}
        <div className="col-span-12 md:col-span-7 flex flex-col gap-1">
            <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-lg p-4 relative min-h-[400px]">
                <div className="absolute top-4 left-4 z-10 flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Image src="/logos/qvr.svg" width={24} height={24} alt="QVR" />
                        <h2 className="text-xl font-bold flex items-center gap-2">QVR/USDT</h2>
                    </div>
                    <span className="text-sm text-green-400 bg-green-900/20 px-2 py-0.5 rounded">+5.24%</span>
                </div>
                {/* Mock Chart */}
                <div className="w-full h-full flex items-end justify-between px-8 pb-8 opacity-30 pt-16">
                    {[40, 60, 45, 70, 65, 80, 55, 90, 85, 100, 95, 120].map((h, i) => (
                        <div key={i} className="w-4 bg-green-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
                    ))}
                </div>
            </div>
            
            {/* Order Book */}
            <div className="h-48 grid grid-cols-2 gap-1">
                 <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-2 overflow-hidden">
                    <div className="text-xs text-gray-500 font-bold mb-2">Order Book</div>
                    <div className="space-y-0.5">
                        {[...Array(5)].map((_, i) => (
                            <div key={`sell-${i}`} className="flex justify-between text-[10px]">
                                <span className="text-red-400">0.45{25 + i}</span>
                                <span className="text-gray-400">{(Math.random() * 1000).toFixed(0)}</span>
                            </div>
                        ))}
                        <div className="text-center text-xs font-bold py-1 text-white border-y border-gray-800 my-1">0.4521</div>
                         {[...Array(5)].map((_, i) => (
                            <div key={`buy-${i}`} className="flex justify-between text-[10px]">
                                <span className="text-green-400">0.45{20 - i}</span>
                                <span className="text-gray-400">{(Math.random() * 1000).toFixed(0)}</span>
                            </div>
                        ))}
                    </div>
                 </div>
                 <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-2">
                    <div className="text-xs text-gray-500 font-bold mb-2">Recent Trades</div>
                    <div className="space-y-0.5">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex justify-between text-[10px]">
                                <span className="text-white">18:24:{10+i}</span>
                                <span className={i % 2 === 0 ? "text-green-400" : "text-red-400"}>0.4521</span>
                                <span className="text-gray-400">540.0</span>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        </div>

        {/* Right Sidebar: Trade Panel */}
        <div className="col-span-12 md:col-span-3 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
             <div className="flex gap-2 mb-6 bg-gray-800 p-1 rounded-lg">
                <button className="flex-1 text-center py-1.5 bg-green-600 text-white rounded text-sm font-bold">Buy</button>
                <button className="flex-1 text-center py-1.5 hover:bg-gray-700 text-gray-400 rounded text-sm font-bold">Sell</button>
             </div>

             <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-500 font-bold uppercase">Price (USDT)</label>
                    <input type="text" value="0.4521" className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-right font-mono text-sm mt-1" />
                </div>
                <div>
                    <label className="text-xs text-gray-500 font-bold uppercase">Amount (QVR)</label>
                    <input type="text" placeholder="0.00" className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-right font-mono text-sm mt-1" />
                </div>
                <button className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg mt-4">
                    Buy QVR
                </button>
             </div>
        </div>
      </div>
    </div>
  );
}
