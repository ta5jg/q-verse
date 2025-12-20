export default function FarmingPage() {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Liquidity Farming</h1>
                    <p className="text-gray-400">Provide liquidity to AMM pools and earn triple yields.</p>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-sm text-gray-500 uppercase font-bold">Total Liquidity</div>
                    <div className="text-3xl font-mono text-white">$854,203,120</div>
                </div>
            </div>
  
            <div className="space-y-4">
                {[
                    { pair: "QVR / USDT", reward: "450% APR", liquidity: "$120M", multiplier: "40x" },
                    { pair: "ETH / QVR", reward: "120% APR", liquidity: "$85M", multiplier: "15x" },
                    { pair: "BTC / QVR", reward: "95% APR", liquidity: "$210M", multiplier: "10x" },
                    { pair: "POPEO / USDT", reward: "12% APR", liquidity: "$400M", multiplier: "2x" },
                ].map((farm, i) => (
                    <div key={i} className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-gray-800/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-6 min-w-[200px]">
                            <div className="flex -space-x-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full border-2 border-gray-900 z-10"></div>
                                <div className="w-10 h-10 bg-green-500 rounded-full border-2 border-gray-900"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{farm.pair}</h3>
                                <div className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded inline-block border border-purple-500/30">
                                    {farm.multiplier} Multiplier
                                </div>
                            </div>
                        </div>
  
                        <div className="grid grid-cols-3 gap-12 w-full md:w-auto text-center md:text-left">
                            <div>
                                <div className="text-xs text-gray-500 font-bold uppercase">APR</div>
                                <div className="text-xl font-bold text-green-400">{farm.reward}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 font-bold uppercase">Liquidity</div>
                                <div className="font-mono">{farm.liquidity}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 font-bold uppercase">Earned</div>
                                <div className="font-mono text-gray-400">0.00</div>
                            </div>
                        </div>
  
                        <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold whitespace-nowrap w-full md:w-auto">
                            Deposit LP
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }
