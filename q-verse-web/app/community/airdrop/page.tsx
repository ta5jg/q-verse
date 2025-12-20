"use client";

import { useState } from "react";

export default function AirdropPage() {
  const [claimed, setClaimed] = useState(false);
  const [xp, setXp] = useState(0);

  // Simple state to track completed tasks
  const [completedTasks, setCompletedTasks] = useState<number[]>([1]); // Task 1 (Connect Wallet) assumed done

  const tasks = [
    { id: 1, title: "Connect Wallet", reward: 50 },
    { id: 2, title: "Follow Q-Verse on X", reward: 100 },
    { id: 3, title: "Join Discord Server", reward: 100 },
    { id: 4, title: "Retweet Pinned Post", reward: 150 },
    { id: 5, title: "Invite 3 Friends", reward: 300 },
  ];

  const handleTaskClick = (id: number, reward: number) => {
    if (completedTasks.includes(id)) return;
    
    // Simulate verification
    const verified = confirm("Did you complete this task?");
    if (verified) {
        setCompletedTasks(prev => [...prev, id]);
        setXp(prev => prev + reward);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 bg-purple-900/30 rounded-full border border-purple-800/50 text-sm text-purple-300 font-bold mb-4 animate-bounce-slow">
                🎁 Massive Airdrop Live
            </div>
            <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Community Rewards Program
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
                Complete tasks, earn XP, and claim your share of the 10,000,000 QVR & RGLS prize pool.
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            
            {/* Left: Stats */}
            <div className="md:col-span-1 space-y-6">
                <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl text-center">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Your XP</h3>
                    <div className="text-4xl font-extrabold text-white mb-1">{xp}</div>
                    <div className="text-purple-400 text-sm font-bold">Level 1: Novice</div>
                </div>
                
                <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl text-center">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Estimated Reward</h3>
                    <div className="text-2xl font-bold text-white mb-1">{(xp * 0.45).toFixed(2)} QVR</div>
                    <div className="text-gray-500 text-xs">Based on current pool share</div>
                </div>

                <div className="bg-blue-900/20 border border-blue-800/50 p-6 rounded-2xl">
                    <h3 className="font-bold mb-2 text-blue-300">Referral Link</h3>
                    <div className="bg-black/30 p-2 rounded text-xs text-gray-400 font-mono mb-2 truncate">
                        https://q-verse.org/ref/user123
                    </div>
                    <button className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded font-bold text-xs">Copy Link</button>
                </div>
            </div>

            {/* Right: Tasks */}
            <div className="md:col-span-2">
                <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-gray-800">
                        <h3 className="font-bold text-lg">Mission Board</h3>
                    </div>
                    <div className="divide-y divide-gray-800">
                        {tasks.map((task) => {
                            const isDone = completedTasks.includes(task.id);
                            return (
                                <div key={task.id} className="p-6 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isDone ? "bg-green-500/20 text-green-400" : "bg-gray-800 text-gray-400"}`}>
                                            {isDone ? "✓" : task.id}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{task.title}</div>
                                            <div className="text-xs text-purple-400 font-bold">+{task.reward} XP</div>
                                        </div>
                                    </div>
                                    
                                    {isDone ? (
                                        <span className="text-green-400 text-sm font-bold">Completed</span>
                                    ) : (
                                        <button 
                                            onClick={() => handleTaskClick(task.id, task.reward)}
                                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm font-bold transition-all"
                                        >
                                            Start
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {!claimed && xp >= 500 && (
                    <div className="mt-8 text-center animate-fade-in">
                        <button 
                            onClick={() => setClaimed(true)}
                            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-bold text-lg shadow-lg shadow-green-500/20"
                        >
                            Claim Airdrop 🚀
                        </button>
                    </div>
                )}
                
                {claimed && (
                    <div className="mt-8 bg-green-900/20 border border-green-500/50 p-4 rounded-xl text-center text-green-400 font-bold animate-pulse">
                        🎉 Tokens claimed! They will arrive in your wallet shortly.
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}
