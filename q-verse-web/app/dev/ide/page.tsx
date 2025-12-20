"use client";

import { useState, useEffect, useRef } from "react";
import { apiMethods } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";

interface CompiledContract {
  id: string;
  contract_name: string;
  wasm_hex: string;
  compiler_version?: string;
  gas_estimate?: number;
}

interface DeployedContract {
  id: string;
  contract_id: string;
  address: string;
  deployer_wallet_id: string;
}

interface LogEntry {
  type: "info" | "success" | "error" | "warning";
  message: string;
  timestamp: Date;
}

const CONTRACT_TEMPLATES = {
  token: `// Q-Verse Token Contract (QRC-20)
use qverse_sdk::prelude::*;

#[contract]
pub mod my_token {
    use super::*;

    #[state]
    pub struct TokenState {
        pub name: String,
        pub symbol: String,
        pub decimals: u8,
        pub total_supply: U256,
        pub balances: Map<Address, U256>,
    }

    #[init]
    pub fn new(name: String, symbol: String, decimals: u8, initial_supply: U256) -> Self {
        let mut state = TokenState {
            name,
            symbol,
            decimals,
            total_supply: initial_supply,
            balances: Map::new(),
        };
        
        // Mint initial supply to deployer
        let deployer = msg::sender();
        state.balances.insert(deployer, initial_supply);
        
        Self { state }
    }

    #[public]
    pub fn transfer(&mut self, to: Address, amount: U256) -> Result<()> {
        let sender = msg::sender();
        let sender_balance = self.state.balances.get(&sender).unwrap_or(&U256::zero());
        
        require!(*sender_balance >= amount, "Insufficient balance");
        
        *self.state.balances.entry(sender).or_insert(U256::zero()) -= amount;
        *self.state.balances.entry(to).or_insert(U256::zero()) += amount;
        
        emit!(Transfer { from: sender, to, amount });
        Ok(())
    }

    #[public]
    pub fn balance_of(&self, owner: Address) -> U256 {
        *self.state.balances.get(&owner).unwrap_or(&U256::zero())
    }

    #[public]
    pub fn total_supply(&self) -> U256 {
        self.state.total_supply
    }
}`,
  
  nft: `// Q-Verse NFT Contract
use qverse_sdk::prelude::*;

#[contract]
pub mod my_nft {
    use super::*;

    #[state]
    pub struct NFTState {
        pub name: String,
        pub symbol: String,
        pub next_token_id: u64,
        pub owners: Map<u64, Address>,
        pub token_uris: Map<u64, String>,
    }

    #[init]
    pub fn new(name: String, symbol: String) -> Self {
        Self {
            state: NFTState {
                name,
                symbol,
                next_token_id: 1,
                owners: Map::new(),
                token_uris: Map::new(),
            }
        }
    }

    #[public]
    pub fn mint(&mut self, to: Address, token_uri: String) -> Result<u64> {
        let token_id = self.state.next_token_id;
        self.state.owners.insert(token_id, to);
        self.state.token_uris.insert(token_id, token_uri);
        self.state.next_token_id += 1;
        
        emit!(Transfer { from: Address::zero(), to, token_id });
        Ok(token_id)
    }

    #[public]
    pub fn owner_of(&self, token_id: u64) -> Option<Address> {
        self.state.owners.get(&token_id).copied()
    }
}`,

  staking: `// Q-Verse Staking Contract
use qverse_sdk::prelude::*;

#[contract]
pub mod staking_pool {
    use super::*;

    #[state]
    pub struct StakingState {
        pub staked_amounts: Map<Address, U256>,
        pub reward_rate: U256, // per block
        pub last_update_block: u64,
    }

    #[init]
    pub fn new(reward_rate: U256) -> Self {
        Self {
            state: StakingState {
                staked_amounts: Map::new(),
                reward_rate,
                last_update_block: block::number(),
            }
        }
    }

    #[public]
    pub fn stake(&mut self, amount: U256) -> Result<()> {
        let sender = msg::sender();
        *self.state.staked_amounts.entry(sender).or_insert(U256::zero()) += amount;
        Ok(())
    }

    #[public]
    pub fn unstake(&mut self, amount: U256) -> Result<()> {
        let sender = msg::sender();
        let staked = self.state.staked_amounts.get(&sender).unwrap_or(&U256::zero());
        require!(*staked >= amount, "Insufficient staked amount");
        *self.state.staked_amounts.entry(sender).or_insert(U256::zero()) -= amount;
        Ok(())
    }

    #[public]
    pub fn get_staked(&self, owner: Address) -> U256 {
        *self.state.staked_amounts.get(&owner).unwrap_or(&U256::zero())
    }
}`,
};

export default function IDEPage() {
  const [code, setCode] = useState(CONTRACT_TEMPLATES.token);
  const [contractName, setContractName] = useState("my_token");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [compiling, setCompiling] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [compiledContract, setCompiledContract] = useState<CompiledContract | null>(null);
  const [deployedContracts, setDeployedContracts] = useState<DeployedContract[]>([]);
  const [activeTab, setActiveTab] = useState<"editor" | "output" | "deployed">("editor");
  const [userWalletId, setUserWalletId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Get user wallet ID from localStorage
    const stored = localStorage.getItem("qverse_user_data");
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        setUserWalletId(userData.wallet?.id || null);
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const addLog = (type: LogEntry["type"], message: string) => {
    setLogs(prev => [...prev, { type, message, timestamp: new Date() }]);
  };

  const handleCompile = async () => {
    if (!code.trim()) {
      addLog("error", "Source code cannot be empty");
      return;
    }

    setCompiling(true);
    addLog("info", "🔨 Compiling contract...");
    addLog("info", `> Contract name: ${contractName}`);
    addLog("info", "> Validating source code...");

    try {
      const response = await fetch("/api/dev/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
          contract_name: contractName,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const compiled = data.data as CompiledContract;
        setCompiledContract(compiled);
        addLog("success", "✅ Compilation successful!");
        addLog("info", `> Contract ID: ${compiled.id}`);
        addLog("info", `> WASM Size: ${(compiled.wasm_hex.length / 2).toLocaleString()} bytes`);
        if (compiled.gas_estimate) {
          addLog("info", `> Estimated Gas: ${compiled.gas_estimate.toLocaleString()}`);
        }
        if (compiled.compiler_version) {
          addLog("info", `> Compiler: ${compiled.compiler_version}`);
        }
        addLog("success", "📦 Ready to deploy!");
      } else {
        addLog("error", `❌ Compilation failed: ${data.error || "Unknown error"}`);
      }
    } catch (error: any) {
      addLog("error", `❌ Connection error: ${error.message || "Failed to connect to backend"}`);
    } finally {
      setCompiling(false);
    }
  };

  const handleDeploy = async () => {
    if (!compiledContract) {
      addLog("error", "Please compile the contract first");
      return;
    }

    if (!userWalletId) {
      addLog("error", "Please connect your wallet first");
      return;
    }

    setDeploying(true);
    addLog("info", "🚀 Deploying contract...");
    addLog("info", `> Compiled Contract ID: ${compiledContract.id}`);

    try {
      const response = await fetch("/api/dev/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compiled_contract_id: compiledContract.id,
          deployer_wallet_id: userWalletId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const deployed = data.data as DeployedContract;
        setDeployedContracts(prev => [...prev, deployed]);
        addLog("success", "✅ Contract deployed successfully!");
        addLog("info", `> Contract ID: ${deployed.contract_id}`);
        addLog("info", `> Address: ${deployed.address}`);
        addLog("success", "🎉 Your contract is now live on Q-Verse!");
      } else {
        addLog("error", `❌ Deployment failed: ${data.error || "Unknown error"}`);
      }
    } catch (error: any) {
      addLog("error", `❌ Connection error: ${error.message || "Failed to connect to backend"}`);
    } finally {
      setDeploying(false);
    }
  };

  const handleVerify = async () => {
    if (!compiledContract) {
      addLog("error", "Please compile the contract first");
      return;
    }

    setVerifying(true);
    addLog("info", "🔍 Verifying contract...");

    try {
      const response = await fetch("/api/dev/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_id: compiledContract.id,
          properties: ["safety", "liveness", "no_reentrancy"],
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const result = data.data;
        if (result.all_verified) {
          addLog("success", "✅ All properties verified!");
        } else {
          addLog("warning", "⚠️ Some properties could not be verified");
        }
        result.properties?.forEach((prop: any) => {
          if (prop.verified) {
            addLog("success", `  ✓ ${prop.property}`);
          } else {
            addLog("warning", `  ✗ ${prop.property}`);
          }
        });
      } else {
        addLog("error", `❌ Verification failed: ${data.error || "Unknown error"}`);
      }
    } catch (error: any) {
      addLog("error", `❌ Connection error: ${error.message || "Failed to connect to backend"}`);
    } finally {
      setVerifying(false);
    }
  };

  const handleGenerateSDK = async (contract: DeployedContract, language: "js" | "rust") => {
    addLog("info", `📦 Generating ${language.toUpperCase()} SDK for ${contract.contract_id}...`);

    try {
      const response = await fetch("/api/dev/sdk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_id: contract.contract_id,
          language,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const sdkCode = data.data.sdk_code;
        // Copy to clipboard
        navigator.clipboard.writeText(sdkCode);
        addLog("success", `✅ ${language.toUpperCase()} SDK generated and copied to clipboard!`);
      } else {
        addLog("error", `❌ SDK generation failed: ${data.error || "Unknown error"}`);
      }
    } catch (error: any) {
      addLog("error", `❌ Connection error: ${error.message || "Failed to connect to backend"}`);
    }
  };

  const loadTemplate = (templateName: keyof typeof CONTRACT_TEMPLATES) => {
    setCode(CONTRACT_TEMPLATES[templateName]);
    setContractName(templateName === "token" ? "my_token" : templateName === "nft" ? "my_nft" : "staking_pool");
    addLog("info", `📄 Loaded ${templateName} template`);
  };

  const handleSave = () => {
    localStorage.setItem(`qverse_ide_${contractName}`, code);
    addLog("success", "💾 Code saved to browser storage");
  };

  useEffect(() => {
    // Load saved code
    const saved = localStorage.getItem(`qverse_ide_${contractName}`);
    if (saved) {
      setCode(saved);
    }
  }, []);

  return (
    <div className="min-h-screen pt-20 flex flex-col h-screen overflow-hidden bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="bg-[#252526] border-b border-[#3e3e42] p-2 flex gap-4 items-center px-4 flex-wrap">
        <div className="font-bold text-gray-300 flex items-center gap-2">
          <span>⚡</span>
          <span>Q-IDE</span>
          <span className="text-xs text-blue-400 font-normal">v2.0 (WASM)</span>
        </div>
        <div className="h-5 w-px bg-gray-600 mx-2"></div>
        
        {/* Contract Name Input */}
        <input
          type="text"
          value={contractName}
          onChange={(e) => setContractName(e.target.value)}
          placeholder="contract_name"
          className="px-3 py-1 bg-[#1e1e1e] border border-gray-600 rounded text-xs text-gray-300 focus:outline-none focus:border-blue-500"
        />

        {/* Templates */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              loadTemplate(e.target.value as keyof typeof CONTRACT_TEMPLATES);
              e.target.value = "";
            }
          }}
          className="px-3 py-1 bg-[#1e1e1e] border border-gray-600 rounded text-xs text-gray-300 focus:outline-none focus:border-blue-500"
        >
          <option value="">📋 Templates</option>
          <option value="token">Token (QRC-20)</option>
          <option value="nft">NFT</option>
          <option value="staking">Staking Pool</option>
        </select>

        <div className="h-5 w-px bg-gray-600 mx-2"></div>

        {/* Actions */}
        <button
          onClick={handleSave}
          className="px-3 py-1.5 hover:bg-[#3e3e42] rounded text-xs text-gray-300"
        >
          💾 Save
        </button>

        <button
          onClick={handleCompile}
          disabled={compiling}
          className={`px-3 py-1.5 rounded text-xs font-bold text-white flex items-center gap-2 transition-all ${
            compiling
              ? "bg-yellow-600 cursor-wait"
              : "bg-green-700 hover:bg-green-600"
          }`}
        >
          <span>{compiling ? "⚙️" : "🔨"}</span>
          {compiling ? "Compiling..." : "Compile"}
        </button>

        <button
          onClick={handleVerify}
          disabled={!compiledContract || verifying}
          className={`px-3 py-1.5 rounded text-xs font-bold text-white flex items-center gap-2 transition-all ${
            !compiledContract || verifying
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-700 hover:bg-blue-600"
          }`}
        >
          <span>{verifying ? "⚙️" : "🔍"}</span>
          Verify
        </button>

        <button
          onClick={handleDeploy}
          disabled={!compiledContract || deploying || !userWalletId}
          className={`px-3 py-1.5 rounded text-xs font-bold text-white flex items-center gap-2 transition-all ${
            !compiledContract || deploying || !userWalletId
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-purple-700 hover:bg-purple-600"
          }`}
        >
          <span>{deploying ? "⚙️" : "🚀"}</span>
          {deploying ? "Deploying..." : "Deploy"}
        </button>

        <div className="flex-1"></div>

        {userWalletId ? (
          <div className="text-xs text-green-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Wallet Connected
          </div>
        ) : (
          <div className="text-xs text-yellow-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
            Connect Wallet
          </div>
        )}

        <div className="text-xs text-gray-500">Target: Q-Verse Mainnet</div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-[#252526] border-r border-[#3e3e42] flex flex-col">
          <div className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-[#3e3e42]">
            Explorer
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2 text-sm text-blue-400 bg-[#37373d] border-l-2 border-blue-400">
              📄 src/{contractName}.rs
            </div>
            <div className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer border-l-2 border-transparent hover:bg-[#2a2d2e]">
              📦 Cargo.toml
            </div>
            <div className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer border-l-2 border-transparent hover:bg-[#2a2d2e]">
              🧪 tests/test_basic.rs
            </div>
          </div>

          {/* Deployed Contracts */}
          {deployedContracts.length > 0 && (
            <div className="border-t border-[#3e3e42] p-3">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Deployed ({deployedContracts.length})
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {deployedContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="p-2 bg-[#1e1e1e] rounded text-xs border border-gray-700"
                  >
                    <div className="text-blue-400 font-mono truncate">
                      {contract.contract_id}
                    </div>
                    <div className="text-gray-500 text-[10px] mt-1 truncate">
                      {contract.address}
                    </div>
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => handleGenerateSDK(contract, "js")}
                        className="flex-1 px-2 py-1 bg-blue-900/50 hover:bg-blue-900 text-blue-300 rounded text-[10px]"
                      >
                        JS
                      </button>
                      <button
                        onClick={() => handleGenerateSDK(contract, "rust")}
                        className="flex-1 px-2 py-1 bg-orange-900/50 hover:bg-orange-900 text-orange-300 rounded text-[10px]"
                      >
                        Rust
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 relative flex flex-col">
          {/* Editor */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              className="w-full h-full bg-[#1e1e1e] text-gray-300 font-mono text-sm p-4 outline-none resize-none leading-relaxed"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
              placeholder="// Write your Q-Verse smart contract here..."
            />
            {compiledContract && (
              <div className="absolute top-4 right-4 bg-green-900/50 border border-green-700 rounded px-3 py-1 text-xs text-green-300">
                ✓ Compiled
              </div>
            )}
          </div>

          {/* Terminal / Output */}
          <div className="h-64 bg-[#1e1e1e] border-t border-[#3e3e42] flex flex-col">
            <div className="flex border-b border-[#3e3e42]">
              <button
                onClick={() => setActiveTab("output")}
                className={`px-4 py-1 text-xs border-t-2 transition-colors ${
                  activeTab === "output"
                    ? "text-white border-blue-500 bg-[#1e1e1e]"
                    : "text-gray-500 border-transparent hover:bg-[#2a2d2e]"
                }`}
              >
                Terminal
              </button>
              <button
                onClick={() => setActiveTab("deployed")}
                className={`px-4 py-1 text-xs border-t-2 transition-colors ${
                  activeTab === "deployed"
                    ? "text-white border-blue-500 bg-[#1e1e1e]"
                    : "text-gray-500 border-transparent hover:bg-[#2a2d2e]"
                }`}
              >
                Deployed ({deployedContracts.length})
              </button>
            </div>
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto">
              {activeTab === "output" ? (
                <>
                  {logs.length === 0 ? (
                    <div className="text-gray-600">Ready to build...</div>
                  ) : (
                    logs.map((log, i) => (
                      <div
                        key={i}
                        className={`mb-1 ${
                          log.type === "error"
                            ? "text-red-400"
                            : log.type === "success"
                            ? "text-green-400"
                            : log.type === "warning"
                            ? "text-yellow-400"
                            : "text-gray-400"
                        }`}
                      >
                        <span className="text-gray-600">
                          [{log.timestamp.toLocaleTimeString()}]
                        </span>{" "}
                        {log.message}
                      </div>
                    ))
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  {deployedContracts.length === 0 ? (
                    <div className="text-gray-600">No deployed contracts yet</div>
                  ) : (
                    deployedContracts.map((contract) => (
                      <div
                        key={contract.id}
                        className="bg-[#252526] border border-gray-700 rounded p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-blue-400 font-mono font-bold">
                            {contract.contract_id}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleGenerateSDK(contract, "js")}
                              className="px-2 py-1 bg-blue-900/50 hover:bg-blue-900 text-blue-300 rounded text-xs"
                            >
                              JS SDK
                            </button>
                            <button
                              onClick={() => handleGenerateSDK(contract, "rust")}
                              className="px-2 py-1 bg-orange-900/50 hover:bg-orange-900 text-orange-300 rounded text-xs"
                            >
                              Rust SDK
                            </button>
                          </div>
                        </div>
                        <div className="text-gray-400 text-xs font-mono">
                          Address: {contract.address}
                        </div>
                        <div className="text-gray-500 text-[10px] mt-1">
                          Deployer: {contract.deployer_wallet_id}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
