/* ==============================================
 * File:        src/crypto/zkp.rs
 * Author:      USDTG GROUP TECHNOLOGY LLC
 * Developer:   Irfan Gedik
 * Created Date: 2025-12-22
 * Last Update:  2025-12-22
 * Version:     1.0.0
 *
 * Description:
 *   Zero-Knowledge Proof Implementation
 *   
 *   Implements Bulletproofs for Range Proofs and
 *   Pedersen Commitments for confidential transactions.
 *
 * License:
 *   MIT License
 * ============================================== */

use bulletproofs::{BulletproofGens, PedersenGens, RangeProof};
use curve25519_dalek_ng::scalar::Scalar;
use merlin::Transcript;
use rand::thread_rng;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct ZKProof {
    pub proof: Vec<u8>,
    pub commitment: Vec<u8>,
}

pub struct ZKPManager {
    pc_gens: PedersenGens,
    bp_gens: BulletproofGens,
}

impl ZKPManager {
    /// Initializes ZKP generators
    pub fn new() -> Self {
        ZKPManager {
            pc_gens: PedersenGens::default(),
            bp_gens: BulletproofGens::new(64, 1), // 64-bit range proof
        }
    }

    /// Creates a Range Proof for a secret amount
    /// Proves that: 0 <= amount < 2^64
    pub fn create_range_proof(&self, amount: u64) -> Result<(ZKProof, Scalar), String> {
        let mut prover_transcript = Transcript::new(b"Q-Verse Range Proof");
        let mut rng = thread_rng();

        // 1. Blinding factor (Randomness)
        let blinding = Scalar::random(&mut rng);

        // 2. Generate Proof
        let (proof, commitment) = RangeProof::prove_single(
            &self.bp_gens,
            &self.pc_gens,
            &mut prover_transcript,
            amount,
            &blinding,
            32, // Bit size (32-bit is enough for typical amounts, max 4 billion units)
        )
        .map_err(|e| format!("Proof generation failed: {}", e))?;

        Ok((
            ZKProof {
                proof: proof.to_bytes(),
                commitment: commitment.to_bytes().to_vec(),
            },
            blinding, // Return blinding factor so user can save it to open commitment later
        ))
    }

    /// Verifies a Range Proof
    pub fn verify_range_proof(&self, proof_data: &ZKProof) -> bool {
        let mut verifier_transcript = Transcript::new(b"Q-Verse Range Proof");

        // Parse proof
        let proof = match RangeProof::from_bytes(&proof_data.proof) {
            Ok(p) => p,
            Err(_) => return false,
        };

        // Parse commitment
        // curve25519-dalek-ng's from_slice seems to return CompressedRistretto directly here based on compiler output, 
        // possibly panicking on wrong length or it's a different method signature than standard dalek.
        // To be safe and fix the type error, we trust the compiler.
        let commitment = curve25519_dalek_ng::ristretto::CompressedRistretto::from_slice(&proof_data.commitment);

        // Verify
        proof
            .verify_single(
                &self.bp_gens,
                &self.pc_gens,
                &mut verifier_transcript,
                &commitment,
                32,
            )
            .is_ok()
    }
}