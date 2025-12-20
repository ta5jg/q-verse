export default function EcosystemPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          The Q-Verse Ecosystem
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          A comprehensive suite of decentralized applications, financial instruments, and security protocols designed for the quantum era.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-20">
        <div className="bg-gray-800/30 p-8 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
          <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6">
            💵
          </div>
          <h2 className="text-3xl font-bold mb-4">USDT-gVerse Integration</h2>
          <p className="text-gray-400 mb-6 leading-relaxed">
            Our strategic integration with the USDT-gVerse network ensures deep liquidity and seamless stablecoin on-ramps. 
            Transfer USDT assets across chains with zero slippage and quantum-proof security layers.
          </p>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center gap-2">✅ Instant Cross-Chain Swaps</li>
            <li className="flex items-center gap-2">✅ Low Fee Structure</li>
            <li className="flex items-center gap-2">✅ Deep Liquidity Pools</li>
          </ul>
        </div>

        <div className="bg-gray-800/30 p-8 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6">
            🏦
          </div>
          <h2 className="text-3xl font-bold mb-4">Hybrid Finance (HyFi)</h2>
          <p className="text-gray-400 mb-6 leading-relaxed">
            Q-Verse isn't just DeFi; it's HyFi. We bridge Real World Assets (RWA) like real estate, gold, and stocks onto the blockchain, 
            secured by legal frameworks and quantum cryptography.
          </p>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center gap-2">✅ RWA Tokenization</li>
            <li className="flex items-center gap-2">✅ Compliance Ready</li>
            <li className="flex items-center gap-2">✅ 24/7 Global Trading</li>
          </ul>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
            { title: "QVR Token", desc: "The native governance and utility token powering the network." },
            { title: "POPEO Stablecoin", desc: "Algorithmic stability backed by a diversified basket of crypto and RWAs." },
            { title: "Quantum Vault", desc: "Institutional-grade custody solution using lattice-based cryptography." }
        ].map((item, i) => (
            <div key={i} className="p-6 border border-gray-800 rounded-xl hover:border-blue-500/50 transition-colors">
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
            </div>
        ))}
      </div>
    </div>
  );
}
