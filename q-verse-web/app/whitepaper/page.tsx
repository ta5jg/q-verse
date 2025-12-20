"use client";

import React from "react";

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6 bg-[#0a0a0f] text-gray-300 font-serif leading-relaxed selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto bg-gray-900/30 border border-gray-800 p-8 md:p-16 rounded-3xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-16 border-b border-gray-800 pb-12">
            <div className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-4">Official Technical Paper v1.0</div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 font-sans">
                Q-Verse Protocol
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-sans">
                A Quantum-Safe, Hybrid Finance Ecosystem Secured by Post-Quantum Cryptography and Artificial Intelligence.
            </p>
            <div className="mt-8 flex justify-center gap-4 text-sm text-gray-500">
                <span>December 2025</span>
                <span>•</span>
                <span>Irfan Gedik & Core Team</span>
            </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-800/50 p-8 rounded-xl mb-16 font-sans">
            <h3 className="text-white font-bold mb-4 uppercase text-sm">Table of Contents</h3>
            <ul className="space-y-2 text-blue-400">
                <li><a href="#abstract" className="hover:underline">1. Abstract</a></li>
                <li><a href="#problem" className="hover:underline">2. The Quantum Threat</a></li>
                <li><a href="#solution" className="hover:underline">3. The Q-Verse Solution</a></li>
                <li><a href="#architecture" className="hover:underline">4. System Architecture (Rust & WASM)</a></li>
                <li><a href="#ai" className="hover:underline">5. Q-Mind AI Engine</a></li>
                <li><a href="#tokenomics" className="hover:underline">6. Tokenomics (QVR, RGLS, POPEO)</a></li>
                <li><a href="#governance" className="hover:underline">7. Decentralized Governance</a></li>
            </ul>
        </div>

        {/* Content Sections */}
        <div className="space-y-16">
            
            <section id="abstract">
                <h2 className="text-3xl font-bold text-white mb-6 font-sans">1. Abstract</h2>
                <p className="mb-4">
                    The advent of quantum computing poses an existential threat to traditional cryptographic primitives (RSA, ECC) that secure 99% of the world's financial infrastructure. Q-Verse proposes a novel, hybrid blockchain architecture built from the ground up in Rust, utilizing NIST-standardized Post-Quantum Cryptography (PQC) algorithms: <strong>CRYSTALS-Dilithium</strong> for digital signatures and <strong>CRYSTALS-Kyber</strong> for key encapsulation.
                </p>
                <p>
                    Beyond security, Q-Verse integrates a heuristic Artificial Intelligence engine (Q-Mind) directly into the consensus layer to detect fraud, optimize gas fees, and provide real-time market insights, creating the world's first "Intelligent Blockchain."
                </p>
            </section>

            <section id="problem">
                <h2 className="text-3xl font-bold text-white mb-6 font-sans">2. The Quantum Threat</h2>
                <div className="bg-red-900/10 border-l-4 border-red-500 p-6 mb-6">
                    <p className="italic text-red-200">
                        "Shor's Algorithm allows a sufficiently powerful quantum computer to factorize large integers in polynomial time, effectively breaking RSA encryption instantly."
                    </p>
                </div>
                <p className="mb-4">
                    Current blockchain networks like Bitcoin and Ethereum rely on Elliptic Curve Cryptography (secp256k1). A quantum computer with approximately 4000 logical qubits could derive private keys from public keys, allowing attackers to drain wallets undetectable. Q-Verse mitigates this by replacing these primitives with lattice-based cryptography, which is mathematically resistant to quantum attacks.
                </p>
            </section>

            <section id="solution">
                <h2 className="text-3xl font-bold text-white mb-6 font-sans">3. The Q-Verse Solution</h2>
                <p className="mb-4">
                    Q-Verse is not just a blockchain; it is a Hybrid Finance (HyFi) ecosystem. It bridges the gap between traditional finance (TradFi) and decentralized finance (DeFi) through:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>ISO 20022 Compliance:</strong> Native support for global banking messaging standards (pain.001, pacs.008).</li>
                    <li><strong>Atomic Settlement:</strong> Instant finality using a custom Rust-BFT consensus mechanism.</li>
                    <li><strong>Asset-Backed Tokens:</strong> Native support for Real World Assets (RWA) like Gold (QVRg) and Stocks.</li>
                </ul>
            </section>

            <section id="architecture">
                <h2 className="text-3xl font-bold text-white mb-6 font-sans">4. System Architecture</h2>
                <p className="mb-6">
                    The core of Q-Verse is written in <strong>Rust</strong>, ensuring memory safety and thread safety without a garbage collector. This results in predictable high performance and eliminates entire classes of bugs (e.g., buffer overflows) common in C++ based chains.
                </p>
                
                <h3 className="text-xl font-bold text-white mb-3 font-sans">4.1 Q-VM (Quantum Virtual Machine)</h3>
                <p className="mb-4">
                    Unlike EVM, Q-VM utilizes <strong>WebAssembly (WASM)</strong> as its bytecode format. This allows developers to write smart contracts in Rust, C++, Go, or TypeScript, democratizing dApp development. The VM includes a "Metering" system to prevent infinite loops (Halting Problem) and ensure fair resource usage.
                </p>

                <h3 className="text-xl font-bold text-white mb-3 font-sans">4.2 P2P Mesh Network</h3>
                <p>
                    Nodes communicate via a decentralized mesh network using <strong>libp2p</strong> with the GossipSub v1.1 protocol. Communication is encrypted using the Noise protocol framework, ensuring metadata privacy and resistance to Deep Packet Inspection (DPI).
                </p>
            </section>

            <section id="ai">
                <h2 className="text-3xl font-bold text-white mb-6 font-sans">5. Q-Mind AI Engine</h2>
                <p className="mb-4">
                    Q-Mind is an embedded heuristic analysis engine that runs on every validator node. It performs:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Anomaly Detection:</strong> Flags transactions that deviate significantly from historical patterns (e.g., flash loan attacks).</li>
                    <li><strong>Dynamic Fee Adjustment:</strong> Predicts network congestion and adjusts gas fees in real-time.</li>
                    <li><strong>Compliance Scoring:</strong> Assigns risk scores to wallets based on on-chain behavior, aiding in AML compliance without sacrificing user privacy.</li>
                </ul>
            </section>

            <section id="tokenomics">
                <h2 className="text-3xl font-bold text-white mb-6 font-sans">6. Tokenomics</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-800 p-6 rounded-xl">
                        <h4 className="font-bold text-blue-400 mb-2">QVR (Native)</h4>
                        <p className="text-sm">The fuel of the network. Used for gas fees, staking, and governance. Deflationary model via burn mechanism.</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl">
                        <h4 className="font-bold text-green-400 mb-2">POPEO (Stable)</h4>
                        <p className="text-sm">Algorithmic stablecoin pegged to a basket of assets (USD, EUR, Gold) for maximum stability.</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl">
                        <h4 className="font-bold text-yellow-400 mb-2">RGLS (Asset)</h4>
                        <p className="text-sm">Regilis token, backed 1:1 by verified Real World Assets (Real Estate, Commodities).</p>
                    </div>
                </div>
            </section>

        </div>

        {/* Footer */}
        <div className="mt-20 pt-12 border-t border-gray-800 text-center">
            <p className="text-gray-500 italic mb-6">"The best way to predict the future is to build it."</p>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg">
                Download PDF Version
            </button>
        </div>

      </div>
    </div>
  );
}
