/* ==============================================
 * File:        q-verse-web/app/tokens/page.tsx
 * Author:      USDTG GROUP TECHNOLOGY LLC
 * Developer:   Irfan Gedik
 * Created Date: 2025-12-24
 * Last Update:  2025-12-24
 * Version:     1.0.0
 *
 * Description:
 *   Token Information Page
 *
 *   Comprehensive token information page displaying
 *   all Q-Verse ecosystem tokens with details, prices,
 *   and Oracle data.
 *
 * License:
 *   MIT License
 * ============================================== */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRealtimePrice } from "@/hooks/useRealtime";

interface TokenInfo {
    symbol: string;
    name: string;
    description: string;
    type: string;
    logo: string;
    initialSupply?: string;
    maxSupply?: string;
    decimals: number;
    quantumEnabled: boolean;
    isMintable: boolean;
    isBurnable: boolean;
    isFreezable: boolean;
    price?: number;
    priceChange24h?: number;
}

const tokens: TokenInfo[] = [
    {
        symbol: "QVR",
        name: "Q-Verse Network Token",
        description: "Primary governance and network fee token. Used for staking, voting, and transaction fees.",
        type: "Governance",
        logo: "/logos/qvr.svg",
        initialSupply: "1,000,000,000",
        maxSupply: "1,000,000,000",
        decimals: 18,
        quantumEnabled: true,
        isMintable: false,
        isBurnable: true,
        isFreezable: false,
    },
    {
        symbol: "RGLS",
        name: "Regilis",
        description: "Store of value token. Starts at $1.00 and maintains stability through algorithmic mechanisms.",
        type: "Value Store",
        logo: "/logos/rgls.svg",
        initialSupply: "100,000,000",
        maxSupply: "Unlimited",
        decimals: 18,
        quantumEnabled: true,
        isMintable: false,
        isBurnable: true,
        isFreezable: true,
    },
    {
        symbol: "POPEO",
        name: "Popeo Stablecoin",
        description: "Algorithmic stablecoin pegged to $1.00. Minted on demand and backed by reserve assets.",
        type: "Stablecoin",
        logo: "/logos/popeo.svg",
        initialSupply: "Minted on demand",
        maxSupply: "Unlimited",
        decimals: 6,
        quantumEnabled: true,
        isMintable: true,
        isBurnable: true,
        isFreezable: true,
    },
    {
        symbol: "QVRt",
        name: "Q-Verse Treasury",
        description: "Token for treasury operations and testing. Used for protocol development and testing purposes.",
        type: "Treasury/Test",
        logo: "/logos/qvrt.svg",
        initialSupply: "10,000,000,000",
        maxSupply: "Unlimited",
        decimals: 18,
        quantumEnabled: true,
        isMintable: true,
        isBurnable: true,
        isFreezable: false,
    },
    {
        symbol: "QVRg",
        name: "Q-Verse Gold",
        description: "Gold-backed digital asset. Represents physical gold reserves held in secure vaults.",
        type: "Commodity",
        logo: "/logos/qvrg.svg",
        initialSupply: "Backed by reserves",
        maxSupply: "Unlimited",
        decimals: 18,
        quantumEnabled: true,
        isMintable: true,
        isBurnable: true,
        isFreezable: false,
    },
];

export default function TokensPage() {
    const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);

    return (
        <div className="min-h-screen pt-24 pb-20 px-6 bg-[#0a0a0f]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        💎 The Magnificent 5 Tokens
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Quantum-safe, regulation-compliant tokens powering the Q-Verse ecosystem.
                        All tokens feature quantum-resistant cryptography and advanced security features.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {tokens.map((token) => (
                        <div
                            key={token.symbol}
                            onClick={() => setSelectedToken(token)}
                            className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl hover:border-blue-500/50 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative w-16 h-16">
                                    <Image
                                        src={token.logo}
                                        alt={token.symbol}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{token.symbol}</h3>
                                    <p className="text-sm text-gray-400">{token.name}</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-300 mb-4 line-clamp-2">{token.description}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-300 rounded">
                                    {token.type}
                                </span>
                                {token.quantumEnabled && (
                                    <span className="text-xs px-2 py-1 bg-purple-900/30 text-purple-300 rounded">
                                        Quantum-Safe
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 text-xs text-gray-400">
                                <div className="flex justify-between">
                                    <span>Decimals:</span>
                                    <span className="text-white font-mono">{token.decimals}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Initial Supply:</span>
                                    <span className="text-white">{token.initialSupply}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Max Supply:</span>
                                    <span className="text-white">{token.maxSupply}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2 text-xs">
                                {token.isMintable && (
                                    <span className="px-2 py-1 bg-green-900/20 text-green-400 rounded">Mintable</span>
                                )}
                                {token.isBurnable && (
                                    <span className="px-2 py-1 bg-red-900/20 text-red-400 rounded">Burnable</span>
                                )}
                                {token.isFreezable && (
                                    <span className="px-2 py-1 bg-yellow-900/20 text-yellow-400 rounded">Freezable</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {selectedToken && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-20 h-20">
                                        <Image
                                            src={selectedToken.logo}
                                            alt={selectedToken.symbol}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-white">{selectedToken.symbol}</h2>
                                        <p className="text-gray-400">{selectedToken.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedToken(null)}
                                    className="text-gray-400 hover:text-white text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <p className="text-gray-300 mb-6">{selectedToken.description}</p>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-800/50 p-4 rounded-xl">
                                    <div className="text-xs text-gray-400 mb-1">Type</div>
                                    <div className="text-lg font-bold text-white">{selectedToken.type}</div>
                                </div>
                                <div className="bg-gray-800/50 p-4 rounded-xl">
                                    <div className="text-xs text-gray-400 mb-1">Decimals</div>
                                    <div className="text-lg font-bold text-white font-mono">{selectedToken.decimals}</div>
                                </div>
                                <div className="bg-gray-800/50 p-4 rounded-xl">
                                    <div className="text-xs text-gray-400 mb-1">Initial Supply</div>
                                    <div className="text-lg font-bold text-white">{selectedToken.initialSupply}</div>
                                </div>
                                <div className="bg-gray-800/50 p-4 rounded-xl">
                                    <div className="text-xs text-gray-400 mb-1">Max Supply</div>
                                    <div className="text-lg font-bold text-white">{selectedToken.maxSupply}</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-bold text-white mb-2">Features</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedToken.quantumEnabled && (
                                        <span className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded">
                                            ✅ Quantum-Safe Cryptography
                                        </span>
                                    )}
                                    {selectedToken.isMintable && (
                                        <span className="px-3 py-1 bg-green-900/30 text-green-300 rounded">
                                            ✅ Mintable
                                        </span>
                                    )}
                                    {selectedToken.isBurnable && (
                                        <span className="px-3 py-1 bg-red-900/30 text-red-300 rounded">
                                            ✅ Burnable
                                        </span>
                                    )}
                                    {selectedToken.isFreezable && (
                                        <span className="px-3 py-1 bg-yellow-900/30 text-yellow-300 rounded">
                                            ✅ Freezable
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
