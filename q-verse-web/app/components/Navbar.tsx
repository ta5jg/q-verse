/* ==============================================
 * File:        q-verse-web/app/components/Navbar.tsx
 * Author:      USDTG GROUP TECHNOLOGY LLC
 * Developer:   Irfan Gedik
 * Created Date: 2025-12-22
 * Last Update:  2025-12-22
 * Version:     1.0.0
 *
 * Description:
 *   Navigation Bar Component
 *
 *   Main navigation component with dropdown menus, user authentication
 *   state display, and responsive mobile menu.
 *
 * License:
 *   MIT License
 * ============================================== */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Check Auth State (Real Check)
  useEffect(() => {
      // Runs on client mount only - no need to re-check on every navigation
      const stored = localStorage.getItem("qverse_user_data");
      if (stored) {
          try {
              setUser(JSON.parse(stored));
          } catch(e) {
              console.error("Auth parsing error", e);
          }
      }
  }, []); // Only run once on mount

  const menuItems = {
    Exchange: [
      { name: "DEX (Swap)", href: "/exchange/dex" },
      { name: "CEX (Pro Trading)", href: "/exchange/cex" },
    ],
    Finance: [
      { name: "Staking Vaults", href: "/finance/staking" },
      { name: "Yield Farming", href: "/finance/farming" },
    ],
    Network: [
      { name: "System Status", href: "/system/status" },
      { name: "Metrics", href: "/system/metrics" },
      { name: "Bridge", href: "/network/bridge" },
      { name: "Explorer", href: "/network/explorer" },
      { name: "Oracles", href: "/network/oracles" },
    ],
    Enterprise: [
      { name: "Dark Pool", href: "/enterprise/dark-pool" },
      { name: "Layer 2 Subnets", href: "/enterprise/layer2" },
      { name: "Compliance", href: "/enterprise/compliance" },
      { name: "Audit Dashboard", href: "/enterprise/audit" },
    ],
    Developers: [
        { name: "IDE", href: "/dev/ide" },
        { name: "Formal Verification", href: "/dev/verification" },
        { name: "API Docs", href: "/developers/api-docs" },
        { name: "Docs", href: "/developers" },
        { name: "Whitepaper", href: "/whitepaper" }
    ],
    Mobile: [
        { name: "iOS App", href: "/mobile" },
        { name: "Android App", href: "/mobile" }
    ],
    Community: [
        { name: "Quantum Universe (3D)", href: "/universe" },
        { name: "Airdrop", href: "/community/airdrop" },
        { name: "Forum", href: "/community" }
    ],
    Governance: [
        { name: "DAO Voting", href: "/governance" }
    ]
  };

  return (
    <nav className="border-b border-gray-800/50 backdrop-blur-md fixed w-full z-50 top-0 bg-[#0a0a0f]/90">
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer group shrink-0">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
            Q
          </div>
          <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
            Q-Verse
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden xl:flex gap-5 text-sm font-medium text-gray-400">
          {Object.entries(menuItems).map(([category, items]) => (
            <div 
                key={category} 
                className="relative group"
                onMouseEnter={() => setActiveDropdown(category)}
                onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className={`hover:text-white transition-colors py-2 flex items-center gap-1 ${activeDropdown === category ? "text-white" : ""}`}>
                {category}
                <span className="text-xs opacity-50">▼</span>
              </button>
              
              {/* Dropdown */}
              <div className={`absolute left-0 top-full pt-2 w-48 transition-all duration-200 ${activeDropdown === category ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
                <div className="bg-[#111116] border border-gray-800 rounded-xl shadow-2xl overflow-hidden p-1">
                    {items.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="block px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="text-xs text-green-400 flex items-center gap-2 px-3 py-1 bg-green-900/20 rounded-full border border-green-900/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Mainnet Live
          </div>
          
          {user ? (
              <div className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-full pl-4 pr-2 py-1">
                  <span className="text-sm font-bold text-white">{user.user.username}</span>
                  <Link href="/#app" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors">
                      Dashboard
                  </Link>
              </div>
          ) : (
            <Link
                href="/#app" 
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
            >
                Connect Wallet
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="xl:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-400 hover:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[#0a0a0f] border-b border-gray-800 max-h-[80vh] overflow-y-auto">
          <div className="px-4 pt-2 pb-4 space-y-4">
            {Object.entries(menuItems).map(([category, items]) => (
                <div key={category}>
                    <div className="text-white font-bold mb-2 uppercase text-xs tracking-wider opacity-50">{category}</div>
                    <div className="pl-4 space-y-2 border-l border-gray-800 ml-1">
                        {items.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="block text-gray-400 hover:text-white py-1"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
            <Link
                href="/#app"
                className="block w-full text-center px-3 py-3 mt-6 bg-blue-600 text-white font-bold rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
            >
                {user ? "Go to Dashboard" : "Connect Wallet"}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
