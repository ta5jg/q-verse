/* ==============================================
 * File:        src/ai.rs
 * Author:      USDTG GROUP TECHNOLOGY LLC
 * Developer:   Irfan Gedik
 * Created Date: 2025-12-22
 * Last Update:  2025-12-22
 * Version:     1.0.0
 *
 * Description:
 *   Q-Mind: Heuristic AI Engine
 *
 *   Transaction analysis and anomaly detection engine.
 *   Analyzes network transactions to detect suspicious patterns.
 *   Future: Integration with TensorFlow/PyTorch models (onnxruntime).
 *
 * License:
 *   MIT License
 * ============================================== */

use serde::{Serialize, Deserialize};
use std::collections::HashMap;

// --- Q-Mind: Heuristic AI Engine ---
// Bu modül, ağ üzerindeki işlemleri analiz ederek anormallikleri tespit eder.
// İleride buraya TensorFlow/PyTorch modelleri (onnxruntime) bağlanabilir.

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TransactionAnalysis {
    pub risk_score: u8, // 0 (Güvenli) - 100 (Tehlikeli)
    pub ai_verdict: String,
    pub detected_patterns: Vec<String>,
}

pub struct QMind {
    // Basit bir bellek içi model (Learning History)
    transaction_history: HashMap<String, Vec<f64>>, 
}

impl QMind {
    pub fn new() -> Self {
        Self {
            transaction_history: HashMap::new(),
        }
    }

    /// İşlemi Analiz Et (Scoring)
    pub fn analyze_transaction(&mut self, amount: f64, sender: &str) -> TransactionAnalysis {
        let mut risk_score = 0;
        let mut patterns = Vec::new();

        // Kural 1: Anormal Miktar Kontrolü (Anomaly Detection)
        // Eğer kullanıcı ortalamasının 10 katı işlem yapıyorsa şüpheli.
        let history = self.transaction_history.entry(sender.to_string()).or_insert(Vec::new());
        if !history.is_empty() {
            let avg: f64 = history.iter().sum::<f64>() / history.len() as f64;
            if amount > avg * 10.0 {
                risk_score += 40;
                patterns.push("High Volume Anomaly".to_string());
            }
        }
        history.push(amount);

        // Kural 2: Yuvarlak Sayı Analizi (Bot Davranışı)
        // Botlar genellikle tam sayılarla işlem yapar (100.0, 5000.0)
        if amount.fract() == 0.0 && amount > 1000.0 {
            risk_score += 10;
            patterns.push("Bot-like Precision".to_string());
        }

        // Kural 3: "Whale" (Balina) Hareketi
        if amount > 1_000_000.0 {
            risk_score += 20;
            patterns.push("Whale Movement".to_string());
        }

        let verdict = if risk_score > 50 {
            "REVIEW_REQUIRED".to_string()
        } else {
            "SAFE".to_string()
        };

        TransactionAnalysis {
            risk_score,
            ai_verdict: verdict,
            detected_patterns: patterns,
        }
    }
}
