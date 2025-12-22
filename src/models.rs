/* ==============================================
 * File:        src/models.rs
 * Author:      USDTG GROUP TECHNOLOGY LLC
 * Developer:   Irfan Gedik
 * Created Date: 2025-12-22
 * Last Update:  2025-12-22
 * Version:     1.0.0
 *
 * Description:
 *   Data Models & Structures
 *   
 *   Defines all core data structures including Users, Wallets,
 *   Transactions (UTXO), and Privacy Primitives.
 *
 * License:
 *   MIT License
 * ============================================== */

use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};

// 💎 The Magnificent 5 Tokens
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum TokenSymbol {
    QVR,   // Network Token
    RGLS,  // Value Store
    POPEO, // Stable Coin
    QVRg,  // Gold
    QVRt   // Test/Treasury
}

impl TryFrom<String> for TokenSymbol {
    type Error = String;

    fn try_from(v: String) -> Result<Self, Self::Error> {
        match v.as_str() {
            "QVR" => Ok(TokenSymbol::QVR),
            "RGLS" => Ok(TokenSymbol::RGLS),
            "POPEO" => Ok(TokenSymbol::POPEO),
            "QVRg" => Ok(TokenSymbol::QVRg),
            "QVRt" => Ok(TokenSymbol::QVRt),
            _ => Err(format!("Unknown token symbol: {}", v)),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum TokenType {
    Governance,
    Utility,
    Stable,
    Asset,
    Test,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TokenMetadata {
    pub symbol: TokenSymbol,
    pub name: String,
    pub description: String,
    pub token_type: TokenType,
    pub initial_supply: Option<f64>, // None for elastic/mint-on-demand
    pub max_supply: Option<f64>,
    pub decimals: u8,
    pub quantum_enabled: bool,
    pub is_mintable: bool,
    pub is_burnable: bool,
    pub is_freezable: bool,
}

impl TokenSymbol {
    pub fn metadata(&self) -> TokenMetadata {
        match self {
            TokenSymbol::QVR => TokenMetadata {
                symbol: TokenSymbol::QVR,
                name: "Q-Verse Network Token".to_string(),
                description: "Primary governance and network fee token.".to_string(),
                token_type: TokenType::Governance,
                initial_supply: Some(1_000_000_000.0),
                max_supply: Some(1_000_000_000.0),
                decimals: 18,
                quantum_enabled: true,
                is_mintable: false,
                is_burnable: true,
                is_freezable: false,
            },
            TokenSymbol::RGLS => TokenMetadata {
                symbol: TokenSymbol::RGLS,
                name: "Regilis".to_string(),
                description: "Store of value token. Starts at $1.00.".to_string(),
                token_type: TokenType::Utility,
                initial_supply: Some(100_000_000.0),
                max_supply: None, 
                decimals: 18,
                quantum_enabled: true,
                is_mintable: false,
                is_burnable: true,
                is_freezable: true,
            },
            TokenSymbol::POPEO => TokenMetadata {
                symbol: TokenSymbol::POPEO,
                name: "Popeo Stablecoin".to_string(),
                description: "Stablecoin pegged to $1.00.".to_string(),
                token_type: TokenType::Stable,
                initial_supply: None, // Minted on demand
                max_supply: None,
                decimals: 6,
                quantum_enabled: true,
                is_mintable: true,
                is_burnable: true,
                is_freezable: true,
            },
            TokenSymbol::QVRg => TokenMetadata {
                symbol: TokenSymbol::QVRg,
                name: "Q-Verse Gold".to_string(),
                description: "Gold-backed digital asset.".to_string(),
                token_type: TokenType::Asset,
                initial_supply: None,
                max_supply: None,
                decimals: 18,
                quantum_enabled: true,
                is_mintable: true,
                is_burnable: true,
                is_freezable: false,
            },
            TokenSymbol::QVRt => TokenMetadata {
                symbol: TokenSymbol::QVRt,
                name: "Q-Verse Treasury".to_string(),
                description: "Token for treasury operations and testing.".to_string(),
                token_type: TokenType::Test,
                initial_supply: Some(10_000_000_000.0),
                max_supply: None,
                decimals: 18,
                quantum_enabled: true,
                is_mintable: true,
                is_burnable: true,
                is_freezable: false,
            },
        }
    }
}


impl ToString for TokenSymbol {
    fn to_string(&self) -> String {
        match self {
            TokenSymbol::QVR => "QVR".to_string(),
            TokenSymbol::RGLS => "RGLS".to_string(),
            TokenSymbol::POPEO => "POPEO".to_string(),
            TokenSymbol::QVRg => "QVRg".to_string(),
            TokenSymbol::QVRt => "QVRt".to_string(),
        }
    }
}

// 👤 User Model
#[derive(Debug, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub created_at: DateTime<Utc>,
    pub is_verified: bool,
    pub quantum_secure: bool,
}

// 👛 Wallet Model (Updated for Key Bundle)
#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct Wallet {
    pub id: Uuid,
    pub user_id: Uuid,
    // Unified Address (starts with qvr...) - represents the bundle
    pub address: String,
    
    // Key Bundle (Public Parts)
    pub spend_public_key: String, // verification key for spending
    pub view_public_key: String,  // key for scanning blockchain
    pub audit_public_key: Option<String>, // optional key for auditors
    
    pub created_at: DateTime<Utc>,
}

impl<'r> sqlx::FromRow<'r, sqlx::sqlite::SqliteRow> for Wallet {
    fn from_row(row: &'r sqlx::sqlite::SqliteRow) -> Result<Self, sqlx::Error> {
        use sqlx::Row;
        Ok(Wallet {
            id: row.get("id"),
            user_id: row.get("user_id"),
            address: row.get("address"),
            spend_public_key: row.get("public_key"), // Map old column
            view_public_key: row.try_get("view_public_key").unwrap_or_else(|_| "legacy_view_key".to_string()),
            audit_public_key: row.try_get("audit_public_key").ok(),
            created_at: {
                let timestamp: i64 = row.get("created_at");
                DateTime::from_timestamp(timestamp, 0).unwrap_or_else(|| Utc::now())
            },
        })
    }
}

impl Wallet {
    /// Creates a new Quantum-Secure Wallet with Spend/View Keys
    pub fn new(user_id: Uuid) -> (Self, String, String) {
        // In a real implementation, we use curve25519-dalek to generate keys
        // Here we simulate it for structure compliance
        let spend_sk = Uuid::new_v4().to_string().replace("-", "");
        let spend_pk = format!("spk_{}", &spend_sk[0..16]);
        
        let view_sk = Uuid::new_v4().to_string().replace("-", "");
        let view_pk = format!("vpk_{}", &view_sk[0..16]);
        
        // Unified address (mock derivation)
        let address = format!("qvr{}{}", &spend_pk[4..], &view_pk[4..]);

        let wallet = Wallet {
            id: Uuid::new_v4(),
            user_id,
            address,
            spend_public_key: spend_pk,
            view_public_key: view_pk,
            audit_public_key: None,
            created_at: Utc::now(),
        };
        
        // Return wallet + private keys (spend, view)
        (wallet, spend_sk, view_sk)
    }
}

// 💰 Balance Model
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Balance {
    pub wallet_id: Uuid,
    pub token_symbol: String,
    pub amount: f64,
    pub updated_at: DateTime<Utc>,
}

// 🛡️ SECURITY & PRIVACY PRIMITIVES (UTXO MODEL)

/// Transaction Types supporting Hybrid Privacy
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, utoipa::ToSchema)]
pub enum TxType {
    /// Standard transparent transaction (like Bitcoin/Ethereum)
    Public,
    /// Fully private transaction (Sender, Receiver, Amount hidden)
    Private,
    /// Private but auditable by specific keys (Regulatory compliance)
    AuditablePrivate,
}

/// A Transaction Output (UTXO)
#[derive(Debug, Serialize, Deserialize, Clone, utoipa::ToSchema)]
pub struct TxOut {
    /// One-time stealth address derived from receiver's View+Spend keys
    /// Prevents linking multiple payments to the same user.
    pub target_key: String, 
    
    /// Pedersen Commitment to the amount (Hides the value but allows math proof)
    pub commitment: String,
    
    /// Encrypted amount and blinding factor (Only receiver can decrypt)
    pub encrypted_data: String,
    
    /// Optional: Encrypted audit blob for "AuditablePrivate" txs
    /// Contains real amount, sender ID, invoice ref, etc.
    pub audit_blob: Option<String>,
}

/// A Transaction Input
#[derive(Debug, Serialize, Deserialize, Clone, utoipa::ToSchema)]
pub struct TxIn {
    /// Key Image: A cryptographic tag that prevents double-spending 
    /// without revealing which output is being spent.
    pub key_image: String,
    
    /// References to possible outputs being spent (Ring members)
    pub ring_offsets: Vec<u64>,
    
    /// Amount commitment of the input (for balance proof)
    pub commitment: Option<String>,
}

/// Audit Policy Definition (For Auditable Tx)
#[derive(Debug, Serialize, Deserialize, Clone, utoipa::ToSchema)]
pub enum AuditPolicy {
    UserOnly,       // Only user can reveal
    DualKey,        // User OR Auditor can reveal
    Threshold(u8),  // M-of-N signatures required
}

// 💸 Transaction Model (Evolved for Privacy)
#[derive(Debug, Serialize, Deserialize, Clone, utoipa::ToSchema)]
pub struct Transaction {
    pub id: String,
    pub tx_type: TxType,
    
    // Inputs (Spending)
    pub inputs: Vec<TxIn>,
    
    // Outputs (Receiving/Change)
    pub outputs: Vec<TxOut>,
    
    // Transparent Fee (Must be visible to miners)
    pub fee: f64,
    
    // Token being transferred
    pub token_symbol: String,
    
    // Proofs
    /// Range Proof (Bulletproofs): Proves amounts are positive without revealing them
    pub range_proof: Option<String>,
    
    /// Ring Signature or ZK Proof: Proves ownership of inputs without revealing source
    pub signature: String,
    
    /// Audit Policy ID (if applicable)
    pub audit_policy: Option<AuditPolicy>,
    
    // Metadata
    pub created_at: i64,
    pub status: String,
}

// Keeping a simplified constructor for compatibility during migration
// In a real scenario, this would involve complex proof generation
impl Transaction {
    pub fn new_public(
        from_wallet_id: &str,
        to_address: &str,
        token: TokenSymbol,
        amount: f64,
        fee: f64
    ) -> Self {
        // This is a placeholder constructor that creates a 'Public' style transaction
        // In the full implementation, this will construct proper Inputs/Outputs
        Transaction {
            id: Uuid::new_v4().to_string(),
            tx_type: TxType::Public,
            inputs: vec![], // Would be populated with UTXOs
            outputs: vec![
                TxOut {
                    target_key: to_address.to_string(),
                    commitment: format!("PUBLIC_{}", amount), // Public commitment
                    encrypted_data: "".to_string(),
                    audit_blob: None,
                }
            ],
            fee,
            token_symbol: token.to_string(),
            range_proof: None,
            signature: "".to_string(),
            audit_policy: None,
            created_at: Utc::now().timestamp(),
            status: "PENDING".to_string(),
        }
    }
}


// 📡 API Responses
#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self { success: true, data: Some(data), error: None }
    }
    pub fn error(msg: String) -> Self {
        Self { success: false, data: None, error: Some(msg) }
    }
}

// 💱 EXCHANGE MODELS

#[derive(Debug, Serialize, Deserialize, Clone, utoipa::ToSchema)]
pub struct LiquidityPool {
    pub id: String,
    pub token_a: String,
    pub token_b: String,
    pub reserve_a: f64,
    pub reserve_b: f64,
    pub total_supply: f64,
    pub fee_rate: f64,
}

impl<'r> sqlx::FromRow<'r, sqlx::sqlite::SqliteRow> for LiquidityPool {
    fn from_row(row: &'r sqlx::sqlite::SqliteRow) -> Result<Self, sqlx::Error> {
        use sqlx::Row;
        Ok(LiquidityPool {
            id: row.get("id"),
            token_a: row.get("token_a"),
            token_b: row.get("token_b"),
            reserve_a: row.get("reserve_a"),
            reserve_b: row.get("reserve_b"),
            total_supply: row.get("total_supply"),
            fee_rate: row.get("fee_rate"),
        })
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum OrderSide {
    Buy,
    Sell,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum OrderType {
    Market,
    Limit,
    StopLoss,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum OrderStatus {
    Pending,
    Filled,
    PartiallyFilled,
    Cancelled,
    Expired,
}

#[derive(Debug, Serialize, Deserialize, Clone, FromRow, utoipa::ToSchema)]
pub struct Order {
    pub id: String,
    pub wallet_id: String,
    pub pair: String,
    pub side: String,
    pub order_type: String,
    pub price: f64,
    pub amount: f64,
    pub filled: f64,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Trade {
    pub id: String,
    pub order_id: String,
    pub pair: String,
    pub price: f64,
    pub amount: f64,
    pub side: String,
    pub maker_wallet_id: String,
    pub taker_wallet_id: String,
    pub fee: f64,
}

// 🌉 BRIDGE MODELS

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum BridgeStatus {
    Pending,
    Validating,
    Completed,
    Failed,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BridgeTransaction {
    pub id: String,
    pub source_chain: String,
    pub target_chain: String,
    pub source_tx_hash: Option<String>,
    pub target_tx_hash: Option<String>,
    pub wallet_id: String,
    pub token_symbol: String,
    pub amount: f64,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BridgeValidator {
    pub id: String,
    pub address: String,
    pub public_key: String,
    pub is_active: bool,
    pub reputation_score: f64,
}

// 🔍 EXPLORER MODELS

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct Block {
    pub id: String,
    pub block_number: i64,
    pub block_hash: String,
    pub previous_hash: Option<String>,
    pub validator_id: Option<String>,
    pub transaction_count: i32,
    pub timestamp: i64,
    pub merkle_root: Option<String>,
}

// 📊 ORACLE MODELS

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PriceFeed {
    pub id: String,
    pub token_symbol: String,
    pub price: f64,
    pub source: String,
    pub timestamp: i64,
    pub is_verified: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AggregatedPrice {
    pub token_symbol: String,
    pub price: f64,
    pub sources_count: i32,
    pub last_updated: i64,
    pub price_change_24h: f64,
}

// 🏛️ GOVERNANCE MODELS

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ProposalStatus {
    Pending,
    Active,
    Passed,
    Rejected,
    Executed,
}

#[derive(Debug, Serialize, Deserialize, Clone, FromRow, utoipa::ToSchema)]
pub struct Proposal {
    pub id: String,
    pub proposal_id: String,
    pub title: String,
    pub description: String,
    pub proposer_wallet_id: String,
    pub status: String,
    pub votes_for: f64,
    pub votes_against: f64,
    pub voting_power_for: f64,
    pub voting_power_against: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum VoteType {
    For,
    Against,
    Abstain,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Vote {
    pub id: String,
    pub proposal_id: String,
    pub wallet_id: String,
    pub vote_type: String,
    pub voting_power: f64,
}

// 💰 YIELD FARMING MODELS

#[derive(Debug, Serialize, Deserialize, Clone, FromRow, utoipa::ToSchema)]
pub struct YieldPool {
    pub id: String,
    pub name: String,
    pub token_symbol: String,
    pub apy: f64,
    pub lock_period_days: i32,
    pub total_staked: f64,
    pub total_rewards: f64,
    pub is_active: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct YieldPosition {
    pub id: String,
    pub pool_id: String,
    pub wallet_id: String,
    pub staked_amount: f64,
    pub rewards_earned: f64,
    pub locked_until: Option<i64>,
}

// 👨‍💻 DEVELOPER MODELS

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct CompiledContract {
    pub id: String,
    pub contract_name: String,
    pub wasm_hex: String,
    pub source_code: Option<String>,
    pub compiler_version: Option<String>,
    pub compiled_by: Option<String>,
    pub gas_estimate: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct DeployedContract {
    pub id: String,
    pub contract_id: String,
    pub compiled_contract_id: Option<String>,
    pub deployer_wallet_id: String,
    pub address: String,
    pub deployment_tx_id: Option<String>,
}

// 🏢 ENTERPRISE MODELS

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DarkPoolOrder {
    pub id: String,
    pub wallet_id: String,
    pub token_symbol: String,
    pub amount: f64,
    pub side: String,
    pub min_price: Option<f64>,
    pub max_price: Option<f64>,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ComplianceLog {
    pub id: String,
    pub transaction_id: Option<String>,
    pub wallet_id: Option<String>,
    pub check_type: String,
    pub result: String,
    pub details: Option<String>,
}

// 🎁 AIRDROP MODELS

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct AirdropCampaign {
    pub id: String,
    pub name: String,
    pub token_symbol: String,
    pub total_amount: f64,
    pub per_claim: f64,
    pub eligibility_criteria: Option<String>,
    pub merkle_root: Option<String>,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AirdropClaim {
    pub id: String,
    pub campaign_id: String,
    pub wallet_id: String,
    pub amount: f64,
    pub merkle_proof: Option<String>,
}

// 💼 WALLET ENHANCEMENT MODELS

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct MultiSigWallet {
    pub id: String,
    pub address: String,
    pub threshold: i32,
    pub total_signers: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MultiSigSigner {
    pub multisig_id: String,
    pub wallet_id: String,
    pub public_key: String,
    pub weight: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct MultiSigTransaction {
    pub id: String,
    pub multisig_id: String,
    pub transaction_id: Option<String>,
    pub status: String,
    pub signatures_count: i32,
    pub required_signatures: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PaymentRequest {
    pub id: String,
    pub from_wallet_id: String,
    pub to_address: String,
    pub token_symbol: String,
    pub amount: f64,
    pub memo: Option<String>,
    pub qr_code_data: Option<String>,
    pub status: String,
    pub expires_at: Option<i64>,
}
