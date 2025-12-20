export default function Layer2Page() {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Enterprise Layer 2</h1>
                    <p className="text-gray-400">Manage your private subnet and sidechains.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold">
                    Deploy New Subnet
                </button>
            </div>
  
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Active Subnets */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold border-b border-gray-800 pb-4">Active Subnets</h2>
                    {[
                        { name: "Bank_Consortium_A", tps: 45000, nodes: 12, status: "Healthy" },
                        { name: "Supply_Chain_Logistics", tps: 1200, nodes: 5, status: "Healthy" },
                        { name: "Healthcare_Data_V2", tps: 8500, nodes: 8, status: "Syncing" },
                    ].map((subnet, i) => (
                        <div key={i} className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl hover:border-blue-500/30 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-bold text-lg text-white">{subnet.name}</h3>
                                    <div className="text-xs text-gray-500 mt-1">ID: subnet-{100+i} • Rust-BFT Consensus</div>
                                </div>
                                <span className={`px-3 py-1 rounded text-xs font-bold ${subnet.status === "Healthy" ? "bg-green-900/30 text-green-400" : "bg-yellow-900/30 text-yellow-400"}`}>
                                    {subnet.status}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-800 p-3 rounded-lg">
                                    <div className="text-gray-500 text-[10px] font-bold uppercase">Throughput</div>
                                    <div className="text-xl font-mono font-bold text-white">{subnet.tps.toLocaleString()} TPS</div>
                                </div>
                                <div className="bg-gray-800 p-3 rounded-lg">
                                    <div className="text-gray-500 text-[10px] font-bold uppercase">Validators</div>
                                    <div className="text-xl font-mono font-bold text-white">{subnet.nodes}</div>
                                </div>
                                <div className="bg-gray-800 p-3 rounded-lg">
                                    <div className="text-gray-500 text-[10px] font-bold uppercase">Uptime</div>
                                    <div className="text-xl font-mono font-bold text-green-400">99.99%</div>
                                </div>
                            </div>
  
                            <div className="mt-6 flex gap-3">
                                <button className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded text-xs font-bold">Explorer</button>
                                <button className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded text-xs font-bold">Config</button>
                                <button className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded text-xs font-bold">Logs</button>
                            </div>
                        </div>
                    ))}
                </div>
  
                {/* Deployment Panel */}
                <div className="bg-gray-900/30 border border-gray-800 p-6 rounded-2xl h-fit">
                    <h3 className="font-bold mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-transparent hover:border-blue-500 transition-all group">
                            <div className="font-bold text-white group-hover:text-blue-400">Add Validator Node</div>
                            <div className="text-xs text-gray-500">Scale your subnet capacity</div>
                        </button>
                        <button className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-transparent hover:border-blue-500 transition-all group">
                            <div className="font-bold text-white group-hover:text-blue-400">Update Consensus</div>
                            <div className="text-xs text-gray-500">Switch between PoA / BFT</div>
                        </button>
                        <button className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-transparent hover:border-blue-500 transition-all group">
                            <div className="font-bold text-white group-hover:text-blue-400">Bridge Assets</div>
                            <div className="text-xs text-gray-500">Transfer from Mainnet to L2</div>
                        </button>
                    </div>
  
                    <div className="mt-8 p-4 bg-blue-900/10 border border-blue-800/30 rounded-xl">
                        <h4 className="font-bold text-sm text-blue-400 mb-2">Resource Usage</h4>
                        <div className="text-xs text-gray-400 mb-1">CPU Load</div>
                        <div className="w-full h-1.5 bg-gray-800 rounded-full mb-3">
                            <div className="w-[45%] h-full bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="text-xs text-gray-400 mb-1">Storage</div>
                        <div className="w-full h-1.5 bg-gray-800 rounded-full">
                            <div className="w-[72%] h-full bg-purple-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }
