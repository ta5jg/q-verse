export default function ExplorerPage() {
    return (
      <div className="min-h-screen pt-24 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-16 relative">
             <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                🔍
             </div>
             <input 
                type="text" 
                placeholder="Search by Address / Tx Hash / Block / Token" 
                className="w-full bg-gray-900 border border-gray-700 rounded-full py-4 pl-12 pr-6 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
             />
          </div>
  
          {/* Network Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
                { label: "QVR Price", value: "$0.45", change: "+5.2%" },
                { label: "Market Cap", value: "$450,240,102", change: "+1.2%" },
                { label: "Transactions", value: "12,450,001", change: "+125k (24h)" },
                { label: "Finality Time", value: "0.8s", change: "Avg" },
            ].map((stat, i) => (
                <div key={i} className="bg-gray-800/40 border border-gray-700 p-6 rounded-2xl">
                    <div className="text-gray-400 text-sm uppercase font-bold mb-2">{stat.label}</div>
                    <div className="text-2xl font-mono font-bold text-white flex items-end gap-2">
                        {stat.value}
                        <span className={`text-xs mb-1 px-1.5 py-0.5 rounded ${stat.change.includes("+") ? "bg-green-900/30 text-green-400" : "bg-gray-700 text-gray-300"}`}>
                            {stat.change}
                        </span>
                    </div>
                </div>
            ))}
          </div>
  
          {/* Latest Activity */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Blocks */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Latest Blocks</h3>
                    <button className="text-blue-400 text-sm hover:text-white">View All</button>
                </div>
                <div className="divide-y divide-gray-700/50">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="p-4 flex items-center gap-4 hover:bg-gray-700/20 transition-colors">
                            <div className="bg-gray-800 p-3 rounded-lg text-sm font-mono font-bold text-blue-400">
                                #{15420345 - i}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold">Validated by <span className="text-blue-300">Validator_{i+1}</span></div>
                                <div className="text-xs text-gray-500">145 txns • {i * 3}s ago</div>
                            </div>
                            <div className="text-right text-xs text-gray-400 font-mono bg-gray-900 px-2 py-1 rounded">
                                0.045 QVR Reward
                            </div>
                        </div>
                    ))}
                </div>
            </div>
  
            {/* Txns */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Latest Transactions</h3>
                    <button className="text-blue-400 text-sm hover:text-white">View All</button>
                </div>
                <div className="divide-y divide-gray-700/50">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="p-4 flex items-center gap-4 hover:bg-gray-700/20 transition-colors">
                            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-lg">
                                📄
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-blue-400 font-mono">0x7a...4b{i}</div>
                                <div className="text-xs text-gray-500">From 0x12... to 0x89... • {i*2}s ago</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-white">1,500 USDT</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
