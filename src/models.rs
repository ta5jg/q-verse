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
