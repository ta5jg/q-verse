use crate::models::{Transaction, TokenSymbol};
use crate::db::Database;
use std::error::Error;
use uuid::Uuid;

/// Batch Operations - Process multiple transactions atomically
pub struct BatchOperations;

impl BatchOperations {
    /// Execute multiple transfers in a single atomic transaction
    pub async fn batch_transfer(
        db: &Database,
        transfers: Vec<BatchTransferItem>,
    ) -> Result<Vec<String>, Box<dyn Error>> {
        let mut db_tx = db.pool.begin().await?;
        let mut tx_ids = Vec::new();

        // Validate all transfers first
        for transfer in &transfers {
            // Check balances
            let balance: f64 = sqlx::query_scalar(
                "SELECT amount FROM balances WHERE wallet_id = ? AND token_symbol = ?"
            )
            .bind(transfer.from_wallet_id.to_string())
            .bind(&transfer.token_symbol)
            .fetch_optional(&mut *db_tx)
            .await?
            .unwrap_or(0.0);

            let total_required = transfer.amount + transfer.fee;
            if balance < total_required {
                return Err(format!(
                    "Insufficient funds for transfer from {}: required {}, available {}",
                    transfer.from_wallet_id, total_required, balance
                ).into());
            }
        }

        // Execute all transfers
        for transfer in transfers {
            let tx_id = Uuid::new_v4().to_string();
            
            // Decrement sender
            sqlx::query(
                "UPDATE balances SET amount = amount - ? - ? WHERE wallet_id = ? AND token_symbol = ?"
            )
            .bind(transfer.amount)
            .bind(transfer.fee)
            .bind(transfer.from_wallet_id.to_string())
            .bind(&transfer.token_symbol)
            .execute(&mut *db_tx)
            .await?;

            // Increment receiver
            sqlx::query(
                "INSERT INTO balances (wallet_id, token_symbol, amount) VALUES (?, ?, ?)
                 ON CONFLICT(wallet_id, token_symbol) DO UPDATE SET amount = amount + ?"
            )
            .bind(transfer.to_wallet_id.to_string())
            .bind(&transfer.token_symbol)
            .bind(transfer.amount)
            .bind(transfer.amount)
            .execute(&mut *db_tx)
            .await?;

            // Record transaction
            sqlx::query(
                "INSERT INTO transactions (id, from_wallet_id, to_wallet_id, token_symbol, amount, fee, status, signature)
                 VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED', ?)"
            )
            .bind(&tx_id)
            .bind(transfer.from_wallet_id.to_string())
            .bind(transfer.to_wallet_id.to_string())
            .bind(&transfer.token_symbol)
            .bind(transfer.amount)
            .bind(transfer.fee)
            .bind(&transfer.signature)
            .execute(&mut *db_tx)
            .await?;

            tx_ids.push(tx_id);
        }

        db_tx.commit().await?;
        Ok(tx_ids)
    }

    /// Batch swap multiple token pairs
    pub async fn batch_swap(
        swaps: Vec<BatchSwapItem>,
    ) -> Result<Vec<BatchSwapResult>, Box<dyn Error>> {
        let mut results = Vec::new();

        for swap in swaps {
            // Calculate swap (simplified - in production, use actual pool reserves)
            let amount_out = swap.amount_in * 0.95; // Mock calculation
            
            results.push(BatchSwapResult {
                token_in: swap.token_in,
                token_out: swap.token_out,
                amount_in: swap.amount_in,
                amount_out,
                fee: swap.amount_in * 0.003,
            });
        }

        Ok(results)
    }
}

#[derive(Debug, Clone)]
pub struct BatchTransferItem {
    pub from_wallet_id: Uuid,
    pub to_wallet_id: Uuid,
    pub token_symbol: String,
    pub amount: f64,
    pub fee: f64,
    pub signature: String,
}

#[derive(Debug, Clone)]
pub struct BatchSwapItem {
    pub token_in: String,
    pub token_out: String,
    pub amount_in: f64,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct BatchSwapResult {
    pub token_in: String,
    pub token_out: String,
    pub amount_in: f64,
    pub amount_out: f64,
    pub fee: f64,
}
