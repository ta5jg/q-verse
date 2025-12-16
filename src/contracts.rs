// 📜 Smart Contract Trait
// Defines the standard interface for all Q-Verse Smart Contracts

use crate::models::{Transaction, TokenSymbol};
use std::error::Error;

pub trait SmartContract {
    /// Returns the unique address/ID of the contract
    fn address(&self) -> String;

    /// Executes a transaction sent to this contract
    fn execute(&self, tx: &Transaction) -> Result<ExecutionResult, Box<dyn Error>>;

    /// Returns the contract's state (serialized)
    fn get_state(&self) -> String;
}

#[derive(Debug)]
pub struct ExecutionResult {
    pub success: bool,
    pub logs: Vec<String>,
    pub gas_used: f64,
}

// 🏦 Example: Staking Contract
// Allows users to stake QVR and earn rewards
pub struct StakingContract {
    pub address: String,
    pub staked_balances: std::collections::HashMap<String, f64>, // WalletID -> Amount
    pub reward_rate: f64, // e.g. 0.05 (5%)
}

impl StakingContract {
    pub fn new() -> Self {
        Self {
            address: "contract_staking_v1".to_string(),
            staked_balances: std::collections::HashMap::new(),
            reward_rate: 0.05,
        }
    }

    pub fn stake(&mut self, wallet_id: String, amount: f64) {
        let balance = self.staked_balances.entry(wallet_id).or_insert(0.0);
        *balance += amount;
    }

    pub fn distribute_rewards(&mut self) -> Vec<(String, f64)> {
        let mut rewards = Vec::new();
        for (wallet, amount) in &self.staked_balances {
            let reward = amount * self.reward_rate;
            rewards.push((wallet.clone(), reward));
        }
        rewards
    }
}

impl SmartContract for StakingContract {
    fn address(&self) -> String {
        self.address.clone()
    }

    fn execute(&self, tx: &Transaction) -> Result<ExecutionResult, Box<dyn Error>> {
        // In a real implementation, this would mutate state based on tx data
        // For now, we simulate success
        if tx.token_symbol == "QVR" {
            Ok(ExecutionResult {
                success: true,
                logs: vec![format!("Staked {} QVR from {}", tx.amount, tx.from_wallet_id)],
                gas_used: 0.002,
            })
        } else {
            Err("Only QVR can be staked".into())
        }
    }

    fn get_state(&self) -> String {
        format!("Total Stakers: {}", self.staked_balances.len())
    }
}

