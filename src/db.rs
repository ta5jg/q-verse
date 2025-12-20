use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite, Row};
use std::error::Error;
use uuid::Uuid;
use crate::models::{User, Wallet, TokenSymbol};

#[derive(Clone)] // Added Clone derive
pub struct Database {
    pub pool: Pool<Sqlite>,
}

impl Database {
    /// Connects to the database using provided URL
    /// Note: Currently only SQLite is fully supported. PostgreSQL support coming soon.
    pub async fn connect_with_url(url: &str, max_connections: u32) -> Result<Self, Box<dyn Error>> {
        if url.starts_with("sqlite:") {
            let pool = SqlitePoolOptions::new()
                .max_connections(max_connections)
                .connect(url).await?;
            Ok(Self { pool })
        } else if url.starts_with("postgresql:") || url.starts_with("postgres:") {
            // PostgreSQL support - convert URL format
            let sqlite_url = "sqlite:qverse.db?mode=rwc";
            log::warn!("PostgreSQL detected but not fully implemented. Falling back to SQLite. URL: {}", url);
            let pool = SqlitePoolOptions::new()
                .max_connections(max_connections)
                .connect(sqlite_url).await?;
            Ok(Self { pool })
        } else {
            Err("Unsupported database URL format. Use 'sqlite:...' or 'postgresql:...'".into())
        }
    }

    /// Connects to the SQLite database (creates file if missing) - Legacy method
    pub async fn connect() -> Result<Self, Box<dyn Error>> {
        Self::connect_with_url("sqlite:qverse.db?mode=rwc", 5).await
    }
    // ... rest of the file (init_schema, helper methods) remains the same ...
    
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

        // Exchange: Liquidity Pools
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS liquidity_pools (
                id TEXT PRIMARY KEY,
                token_a TEXT NOT NULL,
                token_b TEXT NOT NULL,
                reserve_a REAL DEFAULT 0.0,
                reserve_b REAL DEFAULT 0.0,
                total_supply REAL DEFAULT 0.0,
                fee_rate REAL DEFAULT 0.003,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ).execute(&self.pool).await?;

        // Exchange: Orders (Limit Orders)
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                wallet_id TEXT NOT NULL REFERENCES wallets(id),
                pair TEXT NOT NULL,
                side TEXT NOT NULL,
                order_type TEXT NOT NULL,
                price REAL NOT NULL,
                amount REAL NOT NULL,
                filled REAL DEFAULT 0.0,
                status TEXT DEFAULT 'PENDING',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ).execute(&self.pool).await?;

        // Exchange: Trades
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS trades (
                id TEXT PRIMARY KEY,
                order_id TEXT REFERENCES orders(id),
                pair TEXT NOT NULL,
                price REAL NOT NULL,
                amount REAL NOT NULL,
                side TEXT NOT NULL,
                maker_wallet_id TEXT REFERENCES wallets(id),
                taker_wallet_id TEXT REFERENCES wallets(id),
                fee REAL DEFAULT 0.0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ).execute(&self.pool).await?;

        // Bridge: Cross-Chain Transactions
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS bridge_transactions (
                id TEXT PRIMARY KEY,
                source_chain TEXT NOT NULL,
                target_chain TEXT NOT NULL,
                source_tx_hash TEXT,
                target_tx_hash TEXT,
                wallet_id TEXT NOT NULL REFERENCES wallets(id),
                token_symbol TEXT NOT NULL,
                amount REAL NOT NULL,
                status TEXT DEFAULT 'PENDING',
                validator_signatures TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME
            );"
        ).execute(&self.pool).await?;

        // Bridge: Validators
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS bridge_validators (
                id TEXT PRIMARY KEY,
                address TEXT NOT NULL UNIQUE,
                public_key TEXT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                reputation_score REAL DEFAULT 100.0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ).execute(&self.pool).await?;

        // Explorer: Blocks
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS blocks (
                id TEXT PRIMARY KEY,
                block_number INTEGER NOT NULL UNIQUE,
                block_hash TEXT NOT NULL UNIQUE,
                previous_hash TEXT,
                validator_id TEXT,
                transaction_count INTEGER DEFAULT 0,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                merkle_root TEXT
            );"
        ).execute(&self.pool).await?;

        // Explorer: Block Transactions (Index)
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS block_transactions (
                block_id TEXT NOT NULL REFERENCES blocks(id),
                transaction_id TEXT NOT NULL REFERENCES transactions(id),
                index_in_block INTEGER NOT NULL,
                PRIMARY KEY (block_id, transaction_id)
            );"
        ).execute(&self.pool).await?;

        // Oracle: Price Feeds
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS price_feeds (
                id TEXT PRIMARY KEY,
                token_symbol TEXT NOT NULL,
                price REAL NOT NULL,
                source TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_verified BOOLEAN DEFAULT FALSE
            );"
        ).execute(&self.pool).await?;

        // Oracle: Aggregated Prices
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS aggregated_prices (
                token_symbol TEXT PRIMARY KEY,
                price REAL NOT NULL,
                sources_count INTEGER DEFAULT 0,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                price_change_24h REAL DEFAULT 0.0
            );"
        ).execute(&self.pool).await?;

        // Governance: Proposals
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS proposals (
                id TEXT PRIMARY KEY,
                proposal_id TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                proposer_wallet_id TEXT NOT NULL REFERENCES wallets(id),
                status TEXT DEFAULT 'PENDING',
                votes_for REAL DEFAULT 0.0,
                votes_against REAL DEFAULT 0.0,
                voting_power_for REAL DEFAULT 0.0,
                voting_power_against REAL DEFAULT 0.0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                voting_ends_at DATETIME,
                executed_at DATETIME
            );"
        ).execute(&self.pool).await?;

        // Governance: Votes
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS votes (
                id TEXT PRIMARY KEY,
                proposal_id TEXT NOT NULL REFERENCES proposals(id),
                wallet_id TEXT NOT NULL REFERENCES wallets(id),
                vote_type TEXT NOT NULL,
                voting_power REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(proposal_id, wallet_id)
            );"
        ).execute(&self.pool).await?;

        // Yield Farming: Pools
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS yield_pools (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                token_symbol TEXT NOT NULL,
                apy REAL NOT NULL,
                lock_period_days INTEGER DEFAULT 0,
                total_staked REAL DEFAULT 0.0,
                total_rewards REAL DEFAULT 0.0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ).execute(&self.pool).await?;

        // Yield Farming: Positions
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS yield_positions (
                id TEXT PRIMARY KEY,
                pool_id TEXT NOT NULL REFERENCES yield_pools(id),
                wallet_id TEXT NOT NULL REFERENCES wallets(id),
                staked_amount REAL NOT NULL,
                rewards_earned REAL DEFAULT 0.0,
                locked_until DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ).execute(&self.pool).await?;

        // Developer: Compiled Contracts
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS compiled_contracts (
                id TEXT PRIMARY KEY,
                contract_name TEXT NOT NULL,
                wasm_hex TEXT NOT NULL,
                source_code TEXT,
                compiler_version TEXT,
                compiled_by TEXT REFERENCES wallets(id),
                gas_estimate INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ).execute(&self.pool).await?;

        // Developer: Deployed Contracts
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS deployed_contracts (
                id TEXT PRIMARY KEY,
                contract_id TEXT NOT NULL UNIQUE,
                compiled_contract_id TEXT REFERENCES compiled_contracts(id),
                deployer_wallet_id TEXT NOT NULL REFERENCES wallets(id),
                address TEXT NOT NULL UNIQUE,
                deployment_tx_id TEXT REFERENCES transactions(id),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ).execute(&self.pool).await?;

        // Enterprise: Dark Pool Orders
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS dark_pool_orders (
                id TEXT PRIMARY KEY,
                wallet_id TEXT NOT NULL REFERENCES wallets(id),
                token_symbol TEXT NOT NULL,
                amount REAL NOT NULL,
                side TEXT NOT NULL,
                min_price REAL,
                max_price REAL,
                status TEXT DEFAULT 'ACTIVE',
                matched_order_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                executed_at DATETIME
            );"
        ).execute(&self.pool).await?;

        // Enterprise: Compliance Logs
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS compliance_logs (
                id TEXT PRIMARY KEY,
                transaction_id TEXT REFERENCES transactions(id),
                wallet_id TEXT REFERENCES wallets(id),
                check_type TEXT NOT NULL,
                result TEXT NOT NULL,
                details TEXT,
                checked_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ).execute(&self.pool).await?;

        // Airdrop: Campaigns
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS airdrop_campaigns (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                token_symbol TEXT NOT NULL,
                total_amount REAL NOT NULL,
                per_claim REAL NOT NULL,
                eligibility_criteria TEXT,
                merkle_root TEXT,
                status TEXT DEFAULT 'ACTIVE',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                ends_at DATETIME
            );"
        ).execute(&self.pool).await?;

        // Airdrop: Claims
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS airdrop_claims (
                id TEXT PRIMARY KEY,
                campaign_id TEXT NOT NULL REFERENCES airdrop_campaigns(id),
                wallet_id TEXT NOT NULL REFERENCES wallets(id),
                amount REAL NOT NULL,
                merkle_proof TEXT,
                claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(campaign_id, wallet_id)
            );"
        ).execute(&self.pool).await?;

        // Wallet: Multi-Sig Wallets
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS multisig_wallets (
                id TEXT PRIMARY KEY,
                address TEXT NOT NULL UNIQUE,
                threshold INTEGER NOT NULL,
                total_signers INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ).execute(&self.pool).await?;

        // Wallet: Multi-Sig Signers
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS multisig_signers (
                multisig_id TEXT NOT NULL REFERENCES multisig_wallets(id),
                wallet_id TEXT NOT NULL REFERENCES wallets(id),
                public_key TEXT NOT NULL,
                weight INTEGER DEFAULT 1,
                PRIMARY KEY (multisig_id, wallet_id)
            );"
        ).execute(&self.pool).await?;

        // Wallet: Multi-Sig Transactions
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS multisig_transactions (
                id TEXT PRIMARY KEY,
                multisig_id TEXT NOT NULL REFERENCES multisig_wallets(id),
                transaction_id TEXT REFERENCES transactions(id),
                status TEXT DEFAULT 'PENDING',
                signatures_count INTEGER DEFAULT 0,
                required_signatures INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ).execute(&self.pool).await?;

        // Wallet: Multi-Sig Signatures
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS multisig_signatures (
                id TEXT PRIMARY KEY,
                multisig_tx_id TEXT NOT NULL REFERENCES multisig_transactions(id),
                signer_wallet_id TEXT NOT NULL REFERENCES wallets(id),
                signature TEXT NOT NULL,
                signed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(multisig_tx_id, signer_wallet_id)
            );"
        ).execute(&self.pool).await?;

        // Wallet: Payment Requests
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS payment_requests (
                id TEXT PRIMARY KEY,
                from_wallet_id TEXT NOT NULL REFERENCES wallets(id),
                to_address TEXT NOT NULL,
                token_symbol TEXT NOT NULL,
                amount REAL NOT NULL,
                memo TEXT,
                qr_code_data TEXT,
                status TEXT DEFAULT 'PENDING',
                expires_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ).execute(&self.pool).await?;

        // Mobile: Device Tokens
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS mobile_devices (
                id TEXT PRIMARY KEY,
                wallet_id TEXT NOT NULL REFERENCES wallets(id),
                device_token TEXT NOT NULL UNIQUE,
                platform TEXT NOT NULL,
                app_version TEXT,
                last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ).execute(&self.pool).await?;

        // Mobile: Push Notifications
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS push_notifications (
                id TEXT PRIMARY KEY,
                device_id TEXT NOT NULL REFERENCES mobile_devices(id),
                title TEXT NOT NULL,
                body TEXT NOT NULL,
                data TEXT,
                status TEXT DEFAULT 'PENDING',
                sent_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ).execute(&self.pool).await?;

        // Mobile: Biometric Auth
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS biometric_auth (
                id TEXT PRIMARY KEY,
                wallet_id TEXT NOT NULL REFERENCES wallets(id),
                biometric_type TEXT NOT NULL,
                public_key TEXT NOT NULL,
                is_enabled BOOLEAN DEFAULT TRUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
        .bind(&tx.from_wallet_id)
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
        .bind(&tx.from_wallet_id)
        .bind(&tx.token_symbol)
        .execute(&mut *db_tx).await?;

        // 3. Increment Receiver
        // (Upsert logic for SQLite)
        sqlx::query(
            "INSERT INTO balances (wallet_id, token_symbol, amount) VALUES (?, ?, ?)
             ON CONFLICT(wallet_id, token_symbol) DO UPDATE SET amount = amount + ?"
        )
        .bind(&tx.to_wallet_id)
        .bind(&tx.token_symbol)
        .bind(tx.amount)
        .bind(tx.amount) // for the update part
        .execute(&mut *db_tx).await?;

        // 4. Record Transaction
        sqlx::query(
            "INSERT INTO transactions (id, from_wallet_id, to_wallet_id, token_symbol, amount, fee, status, signature)
             VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED', ?)"
        )
        .bind(&tx.id)
        .bind(&tx.from_wallet_id)
        .bind(&tx.to_wallet_id)
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

    pub async fn get_transactions(&self, wallet_id: Uuid) -> Result<Vec<crate::models::Transaction>, Box<dyn Error>> {
        let rows = sqlx::query_as::<_, crate::models::Transaction>(
            "SELECT * FROM transactions 
             WHERE from_wallet_id = ? OR to_wallet_id = ? 
             ORDER BY created_at DESC LIMIT 50"
        )
        .bind(wallet_id.to_string())
        .bind(wallet_id.to_string())
        .fetch_all(&self.pool).await?;

        Ok(rows)
    }

    // --- Exchange Helpers ---
    
    pub async fn get_liquidity_pool(&self, token_a: &str, token_b: &str) -> Result<Option<crate::models::LiquidityPool>, Box<dyn Error>> {
        let pool: Option<crate::models::LiquidityPool> = sqlx::query_as(
            "SELECT * FROM liquidity_pools WHERE (token_a = ? AND token_b = ?) OR (token_a = ? AND token_b = ?)"
        )
        .bind(token_a)
        .bind(token_b)
        .bind(token_b)
        .bind(token_a)
        .fetch_optional(&self.pool).await?;
        
        Ok(pool)
    }

    pub async fn get_wallet(&self, wallet_id: Uuid) -> Result<Option<Wallet>, Box<dyn Error>> {
        let wallet: Option<Wallet> = sqlx::query_as(
            "SELECT * FROM wallets WHERE id = ?"
        )
        .bind(wallet_id.to_string())
        .fetch_optional(&self.pool).await?;
        
        Ok(wallet)
    }

    // --- Governance Helpers ---
    
    pub async fn get_proposal(&self, proposal_id: &str) -> Result<Option<crate::models::Proposal>, Box<dyn Error>> {
        let proposal: Option<crate::models::Proposal> = sqlx::query_as(
            "SELECT * FROM proposals WHERE proposal_id = ?"
        )
        .bind(proposal_id)
        .fetch_optional(&self.pool).await?;
        
        Ok(proposal)
    }

    // --- Oracle Helpers ---
    
    pub async fn get_aggregated_price(&self, token_symbol: &str) -> Result<Option<f64>, Box<dyn Error>> {
        let price: Option<f64> = sqlx::query_scalar(
            "SELECT price FROM aggregated_prices WHERE token_symbol = ?"
        )
        .bind(token_symbol)
        .fetch_optional(&self.pool).await?;
        
        Ok(price)
    }

    // --- Explorer Helpers ---
    
    pub async fn get_block_by_number(&self, block_number: i64) -> Result<Option<crate::models::Block>, Box<dyn Error>> {
        let block: Option<crate::models::Block> = sqlx::query_as(
            "SELECT * FROM blocks WHERE block_number = ?"
        )
        .bind(block_number)
        .fetch_optional(&self.pool).await?;
        
        Ok(block)
    }
}
