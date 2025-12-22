/* ==============================================
 * File:        src/crypto/mod.rs
 * Author:      USDTG GROUP TECHNOLOGY LLC
 * Developer:   Irfan Gedik
 * Created Date: 2025-12-22
 * Last Update:  2025-12-22
 * Version:     1.0.0
 *
 * Description:
 *   Cryptography Module Entry
 *   
 *   Exports Quantum-Safe algorithms and Zero-Knowledge
 *   Proof implementations.
 *
 * License:
 *   MIT License
 * ============================================== */

pub mod zkp;

use pqcrypto_dilithium::dilithium2;
use pqcrypto_traits::sign::{SecretKey as _, PublicKey as _, DetachedSignature as _};
use std::error::Error;

/// Wrapper for Quantum-Safe Cryptography
pub struct QuantumCrypto;

impl QuantumCrypto {
    /// Generates a Dilithium2 Keypair
    pub fn generate_keys() -> (String, String) {
        let (pk, sk) = dilithium2::keypair();
        (hex::encode(pk.as_bytes()), hex::encode(sk.as_bytes()))
    }

    /// Derives an address from a public key (Simplified)
    pub fn derive_address(pk_hex: &str) -> Result<String, Box<dyn Error>> {
        // In a real system, this would involve hashing
        Ok(format!("qvr{}", &pk_hex[0..40]))
    }

    /// Signs data using Dilithium2
    pub fn sign_data(data: &[u8], sk_hex: &str) -> Result<String, Box<dyn Error>> {
        let sk_bytes = hex::decode(sk_hex).map_err(|_| "Invalid Secret Key Hex")?;
        let sk = dilithium2::SecretKey::from_bytes(&sk_bytes).map_err(|_| "Invalid Secret Key Bytes")?;
        
        let signature = dilithium2::detached_sign(data, &sk);
        Ok(hex::encode(signature.as_bytes()))
    }

    /// Verifies a Dilithium2 signature
    pub fn verify_signature(data: &[u8], sig_hex: &str, pk_hex: &str) -> Result<bool, Box<dyn Error>> {
        let pk_bytes = hex::decode(pk_hex).map_err(|_| "Invalid Public Key Hex")?;
        let sig_bytes = hex::decode(sig_hex).map_err(|_| "Invalid Signature Hex")?;
        
        let pk = dilithium2::PublicKey::from_bytes(&pk_bytes).map_err(|_| "Invalid Public Key Bytes")?;
        let sig = dilithium2::DetachedSignature::from_bytes(&sig_bytes).map_err(|_| "Invalid Signature Bytes")?;
        
        match dilithium2::verify_detached_signature(&sig, data, &pk) {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    }
}