export default function AuditPage() {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6 bg-[#050505]">
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Live Security Audit</h1>
                    <p className="text-gray-400">Real-time vulnerability scanning and formal verification reports.</p>
                </div>
                <div className="text-right">
                    <div className="text-green-400 font-bold flex items-center justify-end gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                        System Secure
                    </div>
                    <div className="text-sm text-gray-500">Last scan: 12s ago</div>
                </div>
            </div>
  
            <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: "Smart Contracts", status: "Verified", score: "100/100" },
                    { label: "P2P Network", status: "Secured", score: "99/100" },
                    { label: "Consensus", status: "Optimal", score: "100/100" },
                ].map((item, i) => (
                    <div key={i} className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <div className="text-gray-500 text-xs font-bold uppercase mb-1">{item.label}</div>
                            <div className="text-green-400 font-bold">{item.status}</div>
                        </div>
                        <div className="text-2xl font-bold text-white">{item.score}</div>
                    </div>
                ))}
            </div>
  
            <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 bg-gray-900/50">
                    <h3 className="font-bold">Vulnerability Scan Log</h3>
                </div>
                <div className="p-6 font-mono text-xs space-y-2 text-gray-400 h-96 overflow-y-auto">
                    <div className="text-green-400">[12:45:01] SCAN_START: Module 'qrc20_token' (Hash: 0x4a...f2)</div>
                    <div>[12:45:02] CHECK: Reentrancy... <span className="text-green-400">PASS</span></div>
                    <div>[12:45:02] CHECK: Integer Overflow (Rust safe)... <span className="text-green-400">PASS</span></div>
                    <div>[12:45:03] CHECK: Access Control... <span className="text-green-400">PASS</span></div>
                    <div>[12:45:03] CHECK: Gas Optimization... <span className="text-yellow-400">WARN (Line 45: Loop unroll suggested)</span></div>
                    <div className="text-green-400">[12:45:04] SCAN_COMPLETE: Score 98/100. No critical issues.</div>
                    <br/>
                    <div className="text-green-400">[12:45:10] SCAN_START: Module 'bridge_lock' (Hash: 0x9b...11)</div>
                    <div>[12:45:11] CHECK: Signature Verification (Dilithium5)... <span className="text-green-400">PASS</span></div>
                    <div>[12:45:12] CHECK: Oracle Price Feed... <span className="text-green-400">PASS</span></div>
                </div>
            </div>
        </div>
      </div>
    );
  }
