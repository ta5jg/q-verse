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
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub created_at: DateTime<Utc>,
    pub is_verified: bool,
    pub quantum_secure: bool,
}

// 👛 Wallet Model
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Wallet {
    pub id: Uuid,
    pub user_id: Uuid,
    pub address: String,
    pub public_key: String,
    pub created_at: DateTime<Utc>,
}

impl Wallet {
    /// Creates a new Quantum-Secure Wallet
    pub fn new(user_id: Uuid) -> (Self, String) {
        let (pk, sk) = crate::crypto::QuantumCrypto::generate_keys();
        // For simplicity in this stage, we assume address derivation succeeds
        let address = crate::crypto::QuantumCrypto::derive_address(&pk).unwrap_or_else(|_| "INVALID".to_string());
        
        let wallet = Wallet {
            id: Uuid::new_v4(),
            user_id,
            address,
            public_key: pk,
            created_at: Utc::now(),
        };
        
        (wallet, sk)
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

// 💸 Transaction Model
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Transaction {
    pub id: Uuid,
    pub from_wallet_id: Uuid,
    pub to_wallet_id: Uuid,
    pub token_symbol: String,
    pub amount: f64,
    pub fee: f64,
    pub status: String,
    pub signature: String,
    pub created_at: DateTime<Utc>,
}

impl Transaction {
    /// Creates and signs a new transaction
    pub fn new(
        from_wallet: &Wallet, 
        to_wallet_id: Uuid, 
        token: TokenSymbol, 
        amount: f64, 
        fee: f64, 
        secret_key: &str
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let mut tx = Transaction {
            id: Uuid::new_v4(),
            from_wallet_id: from_wallet.id,
            to_wallet_id,
            token_symbol: token.to_string(),
            amount,
            fee,
            status: "PENDING".to_string(),
            signature: String::new(), // Placeholder until signed
            created_at: Utc::now(),
        };
        
        // Sign the transaction data
        let message = tx.get_signable_bytes();
        let signature = crate::crypto::QuantumCrypto::sign_data(&message, secret_key)?;
        tx.signature = signature;
        
        Ok(tx)
    }
    
    /// Verifies the transaction signature
    pub fn verify(&self, public_key: &str) -> Result<bool, Box<dyn std::error::Error>> {
         let message = self.get_signable_bytes();
         crate::crypto::QuantumCrypto::verify_signature(&message, &self.signature, public_key)
    }
    
    fn get_signable_bytes(&self) -> Vec<u8> {
        // Concatenate relevant fields for signing
        let mut bytes = Vec::new();
        bytes.extend_from_slice(self.from_wallet_id.as_bytes());
        bytes.extend_from_slice(self.to_wallet_id.as_bytes());
        bytes.extend_from_slice(self.token_symbol.as_bytes());
        bytes.extend_from_slice(&self.amount.to_be_bytes());
        bytes.extend_from_slice(&self.fee.to_be_bytes());
        bytes.extend_from_slice(self.id.as_bytes());
        bytes
    }
}


// 📡 API Responses
#[derive(Debug, Serialize)]
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
