import { useState } from "react";

export default function Sidebar({ activeSection, onNavigate }: { activeSection: string, onNavigate: (section: string) => void }) {
  const menuItems = [
    { id: "overview", label: "📊 Overview" },
    { id: "tokens", label: "🪙 Tokens" },
    { id: "dex", label: "🔄 DEX" },
    { id: "cex", label: "🏦 CEX" },
    { id: "staking", label: "💎 Staking" },
    { id: "governance", label: "🏛️ Governance" },
    { id: "analytics", label: "📈 Analytics" },
  ];

  return (
    <aside className="w-64 bg-gray-900/50 backdrop-blur-xl border-r border-gray-800 h-screen fixed left-0 top-20 pt-6 hidden md:block">
      <div className="px-6 mb-8">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          USDTgVerse
        </h2>
        <p className="text-xs text-gray-500">Quantum-Safe Ecosystem</p>
      </div>
      <nav>
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-24 px-6 w-full">
         <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
             <div className="text-xs font-bold text-gray-400 uppercase mb-2">My Balance</div>
             <div className="text-xl font-mono text-white">$12,450.00</div>
             <div className="text-xs text-green-400 mt-1">+2.4% (24h)</div>
         </div>
      </div>
    </aside>
  );
}
