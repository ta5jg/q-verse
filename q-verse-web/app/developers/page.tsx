export default function DevelopersPage() {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-12 items-center mb-20">
            <div className="flex-1">
                <h1 className="text-5xl font-extrabold mb-6">Build on <br/><span className="text-blue-500">Quantum Security</span></h1>
                <p className="text-xl text-gray-400 mb-8">
                    Access the first Rust-based blockchain framework with native post-quantum signature schemes (Dilithium5, Kyber).
                    Build dApps that are future-proof today.
                </p>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">Read Docs</button>
                    <button className="px-6 py-3 border border-gray-700 font-bold rounded-lg hover:border-white transition-colors">View Github</button>
                </div>
            </div>
            <div className="flex-1 bg-gray-900 p-8 rounded-2xl font-mono text-sm border border-gray-800 shadow-2xl">
                <div className="text-gray-500 mb-4">// Example: Initializing a Quantum-Safe Contract</div>
                <div className="text-purple-400">use</div> <div className="text-blue-400 inline">qverse_sdk::contract::prelude::*;</div>
                <br/><br/>
                <div className="text-purple-400">#[qverse_contract]</div>
                <br/>
                <div className="text-blue-400">pub fn</div> <div className="text-yellow-300 inline">init</div>() -{">"} Result&lt;()&gt; {"{"}
                <br/>
                &nbsp;&nbsp;<div className="text-gray-400 inline">// Generate Kyber keypair</div>
                <br/>
                &nbsp;&nbsp;<div className="text-blue-400 inline">let</div> keys = <div className="text-green-400 inline">Crypto::generate_kyber_keys()</div>?;
                <br/>
                &nbsp;&nbsp;<div className="text-blue-400 inline">State::save</div>(keys.public_key);
                <br/>
                &nbsp;&nbsp;<div className="text-blue-400 inline">Ok</div>(())
                <br/>
                {"}"}
            </div>
        </div>
  
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 bg-gray-900/50 rounded-2xl border border-gray-800">
              <h3 className="text-xl font-bold mb-3 text-blue-400">Rust Core</h3>
              <p className="text-gray-400">High-performance execution engine written in pure Rust for maximum safety and speed.</p>
          </div>
          <div className="p-8 bg-gray-900/50 rounded-2xl border border-gray-800">
              <h3 className="text-xl font-bold mb-3 text-purple-400">WASM Support</h3>
              <p className="text-gray-400">Deploy contracts in Rust, C++, or AssemblyScript via WebAssembly.</p>
          </div>
          <div className="p-8 bg-gray-900/50 rounded-2xl border border-gray-800">
              <h3 className="text-xl font-bold mb-3 text-green-400">Oracle Network</h3>
              <p className="text-gray-400">Built-in decentralized oracles for RWA pricing and external data feeds.</p>
          </div>
        </div>
      </div>
    );
  }
