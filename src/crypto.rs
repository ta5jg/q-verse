use pqcrypto_dilithium::dilithium5::{
    keypair, detached_sign, verify_detached_signature,
    PublicKey as DilithiumPublicKey, 
    SecretKey as DilithiumSecretKey,
    DetachedSignature
};
use pqcrypto_traits::sign::{DetachedSignature as DetachedSignatureTrait, PublicKey as PublicKeyTrait, SecretKey as SecretKeyTrait};
use base64::{Engine as _, engine::general_purpose};
use std::error::Error;
use sha2::{Sha256, Digest};

pub struct QuantumCrypto;

impl QuantumCrypto {
    /// Generates a Quantum-Safe (Dilithium5) Keypair
    pub fn generate_keys() -> (String, String) {
        let (pk, sk) = keypair();
        (
            general_purpose::STANDARD.encode(pk.as_bytes()),
            general_purpose::STANDARD.encode(sk.as_bytes())
        )
    }

    /// Generates a Wallet Address from the Public Key (SHA256 Hash)
    pub fn derive_address(public_key_b64: &str) -> Result<String, Box<dyn Error>> {
        let pk_bytes = general_purpose::STANDARD.decode(public_key_b64)?;
        let mut hasher = Sha256::new();
        hasher.update(&pk_bytes);
        let result = hasher.finalize();
        Ok(hex::encode(result))
    }

    /// Signs data using the Secret Key (Detached Signature)
    pub fn sign_data(message: &[u8], secret_key_b64: &str) -> Result<String, Box<dyn Error>> {
        let sk_bytes = general_purpose::STANDARD.decode(secret_key_b64)?;
        let sk = DilithiumSecretKey::from_bytes(&sk_bytes)?;
        let signature = detached_sign(message, &sk);
        Ok(general_purpose::STANDARD.encode(signature.as_bytes()))
    }

    /// Verifies a signature using the Public Key
    pub fn verify_signature(
        message: &[u8],
        signature_b64: &str,
        public_key_b64: &str
    ) -> Result<bool, Box<dyn Error>> {
        let pk_bytes = general_purpose::STANDARD.decode(public_key_b64)?;
        let sig_bytes = general_purpose::STANDARD.decode(signature_b64)?;
        
        let pk = DilithiumPublicKey::from_bytes(&pk_bytes)?;
        let signature = DetachedSignature::from_bytes(&sig_bytes)?;
        
        match verify_detached_signature(&signature, message, &pk) {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    }
}
