"use client";

import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [status, setStatus] = useState("Idle");

  const API_URL = "http://localhost:8080"; // In production, this would be your droplet IP/Domain

  const createAccount = async () => {
    setStatus("Creating Account...");
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.success) {
        setUserData(data.data);
        setStatus("✅ Account Created!");
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (e) {
      setStatus("❌ Network Error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <header className="p-6 border-b border-gray-800">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Q-Verse Web
        </h1>
        <p className="text-gray-400">Quantum-Safe Hybrid Finance Interface</p>
      </header>

      <main className="p-8 max-w-4xl mx-auto">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">🚀 Join the Network</h2>
          <div className="flex gap-4 items-center bg-gray-800 p-6 rounded-xl border border-gray-700">
            <input
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-2 rounded bg-gray-900 border border-gray-600 focus:border-blue-500 focus:outline-none w-64"
            />
            <button
              onClick={createAccount}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold transition-colors"
            >
              Create Account
            </button>
            <span className="text-sm text-gray-400">{status}</span>
          </div>
        </section>

        {userData && (
          <section className="grid md:grid-cols-2 gap-6 animate-fade-in">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-purple-400">👤 User Profile</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">ID:</span> {userData.user.id}</p>
                <p><span className="text-gray-400">Username:</span> {userData.user.username}</p>
                <p><span className="text-gray-400">Verified:</span> {userData.user.is_verified ? "Yes" : "No"}</p>
                <p><span className="text-gray-400">Quantum Secure:</span> {userData.user.quantum_secure ? "True 🔒" : "False"}</p>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-green-400">👛 Quantum Wallet</h3>
              <div className="space-y-2 text-sm break-all">
                <p><span className="text-gray-400">Address:</span></p>
                <p className="font-mono bg-gray-900 p-2 rounded text-xs">{userData.wallet.address}</p>
                <p className="mt-2"><span className="text-gray-400">Secret Key (Save this!):</span></p>
                <p className="font-mono bg-red-900/30 text-red-200 p-2 rounded text-xs blur-sm hover:blur-none transition-all cursor-pointer">
                  {userData.secret_key}
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
