"use client";

import { useState } from "react";

export default function GovernancePage() {
  const [votingPower, setVotingPower] = useState(111.58); // Sqrt(12450 QVR)
  const [votes, setVotes] = useState<{[key: string]: number}>({});

  const proposals = [
    { id: "QIP-45", title: "Integrate USDT-gVerse Bridge V2", desc: "Upgrade the bridge protocol to support batched transactions.", status: "Active", votesFor: 8540, votesAgainst: 120 },
    { id: "QIP-46", title: "Increase Staking Rewards", desc: "Boost APY for QVR validators to 6.5% to attract more nodes.", status: "Active", votesFor: 4200, votesAgainst: 3500 },
    { id: "QIP-47", title: "Burn 5M QVR from Reserve", desc: "Deflationary measure to stabilize token price.", status: "Pending", votesFor: 0, votesAgainst: 0 },
  ];

  const handleVote = (id: string, type: 'for' | 'against') => {
      // Quadratic Voting Logic Simulation
      // Cost = (Votes)^2
      alert(`Casting ${type.toUpperCase()} vote for ${id} using Quadratic Voting power.`);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4">Quadratic Governance DAO</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your voice matters. We use Quadratic Voting to ensure fair representation, not just whale dominance.
            <br/>
            <span className="text-blue-400 font-bold">1 Token ≠ 1 Vote. 1 Person = 1 Voice.</span>
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl text-center">
                <div className="text-gray-500 text-xs font-bold uppercase mb-2">Your QVR Balance</div>
                <div className="text-2xl font-bold text-white">12,450.00</div>
            </div>
            <div className="bg-blue-900/20 border border-blue-800/50 p-6 rounded-2xl text-center">
                <div className="text-blue-300 text-xs font-bold uppercase mb-2">Your Voting Power (√QVR)</div>
                <div className="text-3xl font-bold text-white">{votingPower} VP</div>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl text-center">
                <div className="text-gray-500 text-xs font-bold uppercase mb-2">Active Proposals</div>
                <div className="text-2xl font-bold text-white">3</div>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl text-center">
                <div className="text-gray-500 text-xs font-bold uppercase mb-2">Participation Rate</div>
                <div className="text-2xl font-bold text-green-400">42.5%</div>
            </div>
        </div>

        <div className="space-y-6">
            {proposals.map((prop) => (
                <div key={prop.id} className="bg-gray-800/30 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${prop.status === "Active" ? "bg-green-900/50 text-green-400" : "bg-yellow-900/50 text-yellow-400"}`}>
                                    {prop.status}
                                </span>
                                <span className="text-gray-500 text-sm font-mono">{prop.id}</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{prop.title}</h3>
                            <p className="text-gray-400 text-sm mb-6">{prop.desc}</p>
                            
                            {/* Voting Bar */}
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden flex">
                                <div className="h-full bg-green-500" style={{ width: `${(prop.votesFor / (prop.votesFor + prop.votesAgainst || 1)) * 100}%` }}></div>
                                <div className="h-full bg-red-500" style={{ width: `${(prop.votesAgainst / (prop.votesFor + prop.votesAgainst || 1)) * 100}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs mt-2 font-bold">
                                <span className="text-green-400">{prop.votesFor} VP (For)</span>
                                <span className="text-red-400">{prop.votesAgainst} VP (Against)</span>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center gap-3 min-w-[150px]">
                            <button onClick={() => handleVote(prop.id, 'for')} className="bg-green-600 hover:bg-green-500 py-3 rounded-xl font-bold text-sm">Vote FOR</button>
                            <button onClick={() => handleVote(prop.id, 'against')} className="bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-300 py-3 rounded-xl font-bold text-sm">Vote AGAINST</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
