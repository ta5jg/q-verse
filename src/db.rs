use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite, Row};
use std::error::Error;
use uuid::Uuid;
use crate::models::{User, Wallet, TokenSymbol};

pub struct Database {
    pool: Pool<Sqlite>,
}

impl Database {
    /// Connects to the SQLite database (creates file if missing)
    pub async fn connect() -> Result<Self, Box<dyn Error>> {
        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect("sqlite:qverse.db?mode=rwc").await?;
        
        Ok(Self { pool })
    }

    /// Initializes the database schema
    pub async fn init_schema(&self) -> Result<(), Box<dyn Error>> {
        // Users Table
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                is_verified BOOLEAN DEFAULT FALSE,
                quantum_secure BOOLEAN DEFAULT TRUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ).execute(&self.pool).await?;

        // Wallets Table
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS wallets (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id),
                address TEXT NOT NULL UNIQUE,
                public_key TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ).execute(&self.pool).await?;

        // Balances Table
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS balances (
                wallet_id TEXT NOT NULL REFERENCES wallets(id),
                token_symbol TEXT NOT NULL,
                amount REAL DEFAULT 0.0,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (wallet_id, token_symbol)
            );"
        ).execute(&self.pool).await?;

        // Transactions Table
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                from_wallet_id TEXT REFERENCES wallets(id),
                to_wallet_id TEXT REFERENCES wallets(id),
                token_symbol TEXT NOT NULL,
                amount REAL NOT NULL,
                fee REAL DEFAULT 0.0,
                status TEXT NOT NULL,
                signature TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ).execute(&self.pool).await?;

        // Staking Table
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS stakes (
                wallet_id TEXT NOT NULL REFERENCES wallets(id),
                amount REAL NOT NULL,
                rewards_accrued REAL DEFAULT 0.0,
                staked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (wallet_id)
            );"
        ).execute(&self.pool).await?;

        Ok(())
    }

    // --- Helper Methods ---

    pub async fn create_user(&self, username: &str) -> Result<User, Box<dyn Error>> {
        let id = Uuid::new_v4();
        let user = User {
            id,
            username: username.to_string(),
            is_verified: true,
            quantum_secure: true,
            created_at: chrono::Utc::now(), // Placeholder, DB sets actual time
        };

        sqlx::query(
            "INSERT INTO users (id, username, is_verified, quantum_secure) VALUES (?, ?, ?, ?)"
        )
        .bind(id.to_string())
        .bind(username)
        .bind(true)
        .bind(true)
        .execute(&self.pool).await?;

        Ok(user)
    }

    pub async fn save_wallet(&self, wallet: &Wallet) -> Result<(), Box<dyn Error>> {
        sqlx::query(
            "INSERT INTO wallets (id, user_id, address, public_key) VALUES (?, ?, ?, ?)"
        )
        .bind(wallet.id.to_string())
        .bind(wallet.user_id.to_string())
        .bind(&wallet.address)
        .bind(&wallet.public_key)
        .execute(&self.pool).await?;
        Ok(())
    }

    pub async fn set_balance(&self, wallet_id: Uuid, token: &str, amount: f64) -> Result<(), Box<dyn Error>> {
        sqlx::query(
            "INSERT INTO balances (wallet_id, token_symbol, amount) VALUES (?, ?, ?)
             ON CONFLICT(wallet_id, token_symbol) DO UPDATE SET amount = excluded.amount"
        )
        .bind(wallet_id.to_string())
        .bind(token)
        .bind(amount)
        .execute(&self.pool).await?;
        Ok(())
    }

    pub async fn get_balance(&self, wallet_id: Uuid, token: &str) -> Result<f64, Box<dyn Error>> {
        let row = sqlx::query(
            "SELECT amount FROM balances WHERE wallet_id = ? AND token_symbol = ?"
        )
        .bind(wallet_id.to_string())
        .bind(token)
        .fetch_optional(&self.pool).await?;

        match row {
            Some(r) => Ok(r.try_get("amount")?),
            None => Ok(0.0),
        }
    }

    /// Executes an Atomic Transfer (Balance Check -> Decrement -> Increment -> Record Tx)
    pub async fn process_transfer(
        &self, 
        tx: &crate::models::Transaction
    ) -> Result<(), Box<dyn Error>> {
        let mut db_tx = self.pool.begin().await?;

        // 1. Check Sender Balance
        let sender_balance: f64 = sqlx::query_scalar(
            "SELECT amount FROM balances WHERE wallet_id = ? AND token_symbol = ?"
        )
        .bind(tx.from_wallet_id.to_string())
        .bind(&tx.token_symbol)
        .fetch_optional(&mut *db_tx).await?
        .unwrap_or(0.0);

        let total_required = tx.amount + tx.fee;
        if sender_balance < total_required {
            return Err(format!("Insufficient funds. Required: {}, Available: {}", total_required, sender_balance).into());
        }

        // 2. Decrement Sender
        let new_sender_bal = sender_balance - total_required;
        sqlx::query(
            "UPDATE balances SET amount = ? WHERE wallet_id = ? AND token_symbol = ?"
        )
        .bind(new_sender_bal)
        .bind(tx.from_wallet_id.to_string())
        .bind(&tx.token_symbol)
        .execute(&mut *db_tx).await?;

        // 3. Increment Receiver
        // (Upsert logic for SQLite)
        sqlx::query(
            "INSERT INTO balances (wallet_id, token_symbol, amount) VALUES (?, ?, ?)
             ON CONFLICT(wallet_id, token_symbol) DO UPDATE SET amount = amount + ?"
        )
        .bind(tx.to_wallet_id.to_string())
        .bind(&tx.token_symbol)
        .bind(tx.amount)
        .bind(tx.amount) // for the update part
        .execute(&mut *db_tx).await?;

        // 4. Record Transaction
        sqlx::query(
            "INSERT INTO transactions (id, from_wallet_id, to_wallet_id, token_symbol, amount, fee, status, signature)
             VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED', ?)"
        )
        .bind(tx.id.to_string())
        .bind(tx.from_wallet_id.to_string())
        .bind(tx.to_wallet_id.to_string())
        .bind(&tx.token_symbol)
        .bind(tx.amount)
        .bind(tx.fee)
        .bind(&tx.signature)
        .execute(&mut *db_tx).await?;

        db_tx.commit().await?;
        Ok(())
    }

    /// Executes a Staking Transaction (Balance Decrement -> Stake Increment)
    pub async fn stake_tokens(
        &self,
        wallet_id: Uuid,
        amount: f64
    ) -> Result<(), Box<dyn Error>> {
        let mut db_tx = self.pool.begin().await?;

        // 1. Check Balance
        let current_balance: f64 = sqlx::query_scalar(
            "SELECT amount FROM balances WHERE wallet_id = ? AND token_symbol = 'QVR'"
        )
        .bind(wallet_id.to_string())
        .fetch_optional(&mut *db_tx).await?
        .unwrap_or(0.0);

        if current_balance < amount {
            return Err("Insufficient QVR balance for staking".into());
        }

        // 2. Deduct Balance
        let new_balance = current_balance - amount;
        sqlx::query(
            "UPDATE balances SET amount = ? WHERE wallet_id = ? AND token_symbol = 'QVR'"
        )
        .bind(new_balance)
        .bind(wallet_id.to_string())
        .execute(&mut *db_tx).await?;

        // 3. Add to Stakes
        sqlx::query(
            "INSERT INTO stakes (wallet_id, amount) VALUES (?, ?)
             ON CONFLICT(wallet_id) DO UPDATE SET amount = amount + ?"
        )
        .bind(wallet_id.to_string())
        .bind(amount)
        .bind(amount)
        .execute(&mut *db_tx).await?;

        db_tx.commit().await?;
        Ok(())
    }

    pub async fn get_stake(&self, wallet_id: Uuid) -> Result<f64, Box<dyn Error>> {
        let row = sqlx::query(
            "SELECT amount FROM stakes WHERE wallet_id = ?"
        )
        .bind(wallet_id.to_string())
        .fetch_optional(&self.pool).await?;

        match row {
            Some(r) => Ok(r.try_get("amount")?),
            None => Ok(0.0),
        }
    }
}

