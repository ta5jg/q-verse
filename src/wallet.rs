use crate::models::{MultiSigWallet, MultiSigSigner, PaymentRequest};
use std::error::Error;
use uuid::Uuid;

/// Multi-Signature Wallet Manager
pub struct MultiSigManager;

impl MultiSigManager {
    /// Create a new multi-sig wallet
    pub fn create_multisig(
        signers: Vec<String>, // Wallet IDs
        threshold: usize,
    ) -> Result<MultiSigWallet, Box<dyn Error>> {
        if threshold == 0 || threshold > signers.len() {
            return Err("Invalid threshold".into());
        }

        let multisig_id = Uuid::new_v4().to_string();
        let address = format!("multisig:{}", hex::encode(&multisig_id.as_bytes()[..16]));

        Ok(MultiSigWallet {
            id: multisig_id,
            address,
            threshold: threshold as i32,
            total_signers: signers.len() as i32,
        })
    }

    /// Verify if enough signatures are collected
    pub fn verify_signatures(
        signatures_count: i32,
        required: i32,
    ) -> bool {
        signatures_count >= required
    }
}

/// QR Code Generator for Payment Requests
pub struct QRCodeGenerator;

impl QRCodeGenerator {
    /// Generate QR code data for a payment request
    /// Format: qverse://pay?to={address}&token={token}&amount={amount}&memo={memo}
    pub fn generate_payment_qr(
        to_address: &str,
        token: &str,
        amount: f64,
        memo: Option<&str>,
    ) -> String {
        let mut qr_data = format!("qverse://pay?to={}&token={}&amount={}", to_address, token, amount);
        if let Some(m) = memo {
            qr_data.push_str(&format!("&memo={}", m.replace(" ", "%20")));
        }
        qr_data
    }

    /// Parse QR code data
    pub fn parse_payment_qr(qr_data: &str) -> Result<(String, String, f64, Option<String>), Box<dyn Error>> {
        // Simple parsing (in production, use proper URL parsing)
        if !qr_data.starts_with("qverse://pay?") {
            return Err("Invalid QR code format".into());
        }

        // Extract parameters (simplified)
        let parts: Vec<&str> = qr_data.split('?').collect();
        if parts.len() < 2 {
            return Err("Invalid QR format".into());
        }

        let params: Vec<&str> = parts[1].split('&').collect();
        let mut to_address = String::new();
        let mut token = String::new();
        let mut amount = 0.0;
        let mut memo = None;

        for param in params {
            let kv: Vec<&str> = param.split('=').collect();
            if kv.len() == 2 {
                match kv[0] {
                    "to" => to_address = kv[1].to_string(),
                    "token" => token = kv[1].to_string(),
                    "amount" => amount = kv[1].parse().unwrap_or(0.0),
                    "memo" => memo = Some(kv[1].to_string()),
                    _ => {}
                }
            }
        }

        if to_address.is_empty() || token.is_empty() {
            return Err("Missing required parameters".into());
        }

        Ok((to_address, token, amount, memo))
    }
}

/// Payment Gateway Handler
pub struct PaymentGateway;

impl PaymentGateway {
    /// Create a payment request
    pub fn create_payment_request(
        from_wallet_id: String,
        to_address: String,
        token: String,
        amount: f64,
        memo: Option<String>,
    ) -> PaymentRequest {
        let id = Uuid::new_v4().to_string();
        let qr_data = QRCodeGenerator::generate_payment_qr(&to_address, &token, amount, memo.as_deref());

        PaymentRequest {
            id,
            from_wallet_id,
            to_address,
            token_symbol: token,
            amount,
            memo,
            qr_code_data: Some(qr_data),
            status: "PENDING".to_string(),
            expires_at: Some(chrono::Utc::now().timestamp() + 3600), // 1 hour expiry
        }
    }

    /// Validate payment request
    pub fn validate_payment_request(request: &PaymentRequest) -> Result<(), Box<dyn Error>> {
        if request.amount <= 0.0 {
            return Err("Invalid amount".into());
        }

        if let Some(expires_at) = request.expires_at {
            if expires_at < chrono::Utc::now().timestamp() {
                return Err("Payment request expired".into());
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_multisig_creation() {
        let signers = vec!["wallet1".to_string(), "wallet2".to_string(), "wallet3".to_string()];
        let multisig = MultiSigManager::create_multisig(signers, 2).unwrap();
        assert_eq!(multisig.threshold, 2);
        assert_eq!(multisig.total_signers, 3);
    }

    #[test]
    fn test_qr_generation() {
        let qr = QRCodeGenerator::generate_payment_qr("0x123", "QVR", 100.0, Some("Test"));
        assert!(qr.contains("qverse://pay"));
        assert!(qr.contains("0x123"));
    }
}
