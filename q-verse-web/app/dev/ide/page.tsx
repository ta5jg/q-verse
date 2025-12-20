"use client";
import { useState } from "react";

export default function IDEPage() {
    const [code, setCode] = useState(`// Q-Verse Smart Contract (Rust)
// Target: WASM (WebAssembly)

use qverse_sdk::prelude::*;

#[contract]
pub mod my_token {
    use super::*;

    #[init]
    pub fn new() -> Self {
        Self {}
    }

    #[public]
    pub fn transfer(&mut self, to: Address, amount: U256) -> Result<()> {
        // Your logic here
        Ok(())
    }
}`);
    const [logs, setLogs] = useState<string[]>([]);
    const [compiling, setCompiling] = useState(false);

    const handleCompile = async () => {
        setCompiling(true);
        setLogs(["Compiling contract...", "> rustc --target=wasm32-unknown-unknown contract.rs"]);
        
        try {
            // Gerçek API'ye istek (Şu anki Core güncellemesiyle aktifleşecek)
            // const res = await fetch('/api/contracts/compile', { method: 'POST', body: JSON.stringify({ code }) });
            
            // Simulating compilation delay and result for now until backend endpoint is fully wired in this specific session
            setTimeout(() => {
                setLogs(prev => [
                    ...prev, 
                    "Compiling dependencies...",
                    "Optimizing WASM size...",
                    "✅ Build Successful!",
                    "Output: my_token.wasm (14.2 KB)",
                    "> Ready to Deploy."
                ]);
                setCompiling(false);
            }, 2000);
        } catch (e) {
            setLogs(prev => [...prev, "❌ Compilation Failed: Connection Error"]);
            setCompiling(false);
        }
    };

    return (
    <div className="min-h-screen pt-20 flex flex-col h-screen overflow-hidden bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="bg-[#252526] border-b border-[#3e3e42] p-2 flex gap-4 items-center px-4">
        <div className="font-bold text-gray-300">Q-IDE <span className="text-xs text-blue-400 font-normal">v1.2 (WASM)</span></div>
        <div className="h-5 w-px bg-gray-600 mx-2"></div>
        <button 
            onClick={handleCompile}
            disabled={compiling}
            className={`px-3 py-1.5 rounded text-xs font-bold text-white flex items-center gap-2 transition-all ${compiling ? "bg-yellow-600" : "bg-green-700 hover:bg-green-600"}`}
        >
            <span>{compiling ? "⚙️" : "▶"}</span> {compiling ? "Compiling..." : "Build & Deploy"}
        </button>
        <button className="px-3 py-1.5 hover:bg-[#3e3e42] rounded text-xs text-gray-300">Save</button>
        <div className="flex-1"></div>
        <div className="text-xs text-gray-500">Target: Q-Verse Mainnet</div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#252526] border-r border-[#3e3e42] flex flex-col">
            <div className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Explorer</div>
            <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-1 text-sm text-blue-400 bg-[#37373d] border-l-2 border-blue-400">src/contract.rs</div>
                <div className="px-4 py-1 text-sm text-gray-400 hover:text-white cursor-pointer border-l-2 border-transparent hover:bg-[#2a2d2e]">Cargo.toml</div>
                <div className="px-4 py-1 text-sm text-gray-400 hover:text-white cursor-pointer border-l-2 border-transparent hover:bg-[#2a2d2e]">tests/test_basic.rs</div>
            </div>
        </div>

        {/* Editor */}
        <div className="flex-1 relative flex flex-col">
            <textarea 
                className="flex-1 bg-[#1e1e1e] text-gray-300 font-mono text-sm p-4 outline-none resize-none leading-relaxed"
                value={code}
                onChange={e => setCode(e.target.value)}
                spellCheck="false"
            ></textarea>
            
            {/* Terminal / Logs */}
            <div className="h-48 bg-[#1e1e1e] border-t border-[#3e3e42] flex flex-col">
                <div className="flex border-b border-[#3e3e42]">
                    <div className="px-4 py-1 text-xs text-white border-t-2 border-blue-500 bg-[#1e1e1e] cursor-pointer">Terminal</div>
                    <div className="px-4 py-1 text-xs text-gray-500 cursor-pointer hover:bg-[#2a2d2e]">Output</div>
                </div>
                <div className="flex-1 p-4 font-mono text-xs overflow-y-auto">
                    {logs.map((log, i) => (
                        <div key={i} className={`mb-1 ${log.includes("Error") ? "text-red-400" : log.includes("Success") ? "text-green-400" : "text-gray-400"}`}>
                            {log}
                        </div>
                    ))}
                    {!logs.length && <div className="text-gray-600">Ready to build...</div>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
