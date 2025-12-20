"use client";

export default function StakingPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
            <h1 className="text-5xl font-extrabold mb-4">Quantum Yield Vaults</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">Secure your assets in our non-custodial staking smart contracts and earn real-time rewards.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            {[
                { token: "QVR", apy: "5.0%", lock: "No Lock", tvl: "$125M" },
                { token: "QVR-USDT LP", apy: "12.5%", lock: "7 Days", tvl: "$45M" },
                { token: "POPEO", apy: "4.2%", lock: "No Lock", tvl: "$80M" },
                { token: "QVR (Long Term)", apy: "18.0%", lock: "365 Days", tvl: "$250M" },
            ].map((pool, i) => (
                <div key={i} className="bg-gray-800/40 border border-gray-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                                {pool.token.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{pool.token}</h3>
                                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">{pool.lock}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-400">APY</div>
                            <div className="text-2xl font-bold text-green-400">{pool.apy}</div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">TVL</span>
                            <span className="font-mono">{pool.tvl}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">My Stake</span>
                            <span className="font-mono">0.00</span>
                        </div>
                    </div>

                    <button className="w-full py-3 bg-gray-700 hover:bg-blue-600 rounded-xl font-bold transition-colors group-hover:shadow-lg group-hover:shadow-blue-500/20">
                        Stake Now
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
