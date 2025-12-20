export default function DarkPoolPage() {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
            <div className="border border-gray-800 bg-gray-900/20 p-8 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <span className="w-3 h-3 bg-gray-500 rounded-full animate-pulse"></span>
                        Institutional Dark Pool
                    </h1>
                    <p className="text-gray-500 max-w-xl">
                        Execute large block trades with zero market impact and complete privacy. 
                        Powered by Zero-Knowledge Proofs and Quantum Encryption.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 border border-gray-700 hover:bg-gray-800 rounded-lg text-sm font-bold">Read Compliance</button>
                    <button className="px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-bold">Access Terminal</button>
                </div>
            </div>
  
            <div className="grid md:grid-cols-3 gap-8 text-center py-20 opacity-50 select-none">
                <div className="border border-dashed border-gray-800 p-12 rounded-2xl">
                    <div className="text-4xl mb-4">🔒</div>
                    <h3 className="font-bold mb-2">Hidden Order Book</h3>
                    <p className="text-sm text-gray-500">Orders are encrypted until execution.</p>
                </div>
                <div className="border border-dashed border-gray-800 p-12 rounded-2xl">
                    <div className="text-4xl mb-4">⚡</div>
                    <h3 className="font-bold mb-2">Atomic Settlement</h3>
                    <p className="text-sm text-gray-500">T+0 Settlement for volumes &gt;$10M.</p>
                </div>
                <div className="border border-dashed border-gray-800 p-12 rounded-2xl">
                    <div className="text-4xl mb-4">🕵️</div>
                    <h3 className="font-bold mb-2">Identity Masking</h3>
                    <p className="text-sm text-gray-500">ZK-ID verification required for entry.</p>
                </div>
            </div>
            
            <div className="text-center text-red-500/50 font-mono text-sm uppercase tracking-widest mt-8">
                Restricted Access Area • KYC Level 3 Required
            </div>
        </div>
      </div>
    );
  }
