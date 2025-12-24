/* ==============================================
 * File:        src/compliance.rs
 * Author:      USDTG GROUP TECHNOLOGY LLC
 * Developer:   Irfan Gedik
 * Created Date: 2025-12-22
 * Last Update:  2025-12-22
 * Version:     1.0.0
 *
 * Description:
 *   Banking Compliance and ISO 20022 Module
 *
 *   ISO 20022 standard data structures for bank integration.
 *   KYC/AML compliance structures and status management.
 *
 * License:
 *   MIT License
 * ============================================== */

use serde::{Serialize, Deserialize};

// --- ISO 20022 Standartları ---
// USDTgVerse'nin "Host-to-Host" sistemine karşılık gelen, 
// bankalarla konuşmamızı sağlayacak veri yapıları.

// PAIN.001: Customer Credit Transfer Initiation
// Müşteri para transferi başlatma mesajı
#[derive(Debug, Serialize, Deserialize)]
pub struct Pain001 {
    pub msg_id: String,
    pub cred_dt_tm: String,
    pub nb_of_txs: u32,
    pub initg_pty: PartyIdentification,
    pub pmt_inf: Vec<PaymentInstruction>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentInstruction {
    pub pmt_inf_id: String,
    pub pmt_mthd: String, // TRF (Transfer) or CHK (Check)
    pub dbtr: PartyIdentification,
    pub dbtr_acct: AccountIdentification,
    pub cdt_trf_tx_inf: Vec<CreditTransferTransaction>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreditTransferTransaction {
    pub pmt_id: PaymentIdentification,
    pub amt: Amount,
    pub cdtr: PartyIdentification,
    pub cdtr_acct: AccountIdentification,
}

// Ortak Tipler
#[derive(Debug, Serialize, Deserialize)]
pub struct PartyIdentification {
    pub nm: String, // İsim
    pub pstl_adr: Option<PostalAddress>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PostalAddress {
    pub ctry: String,
    pub adr_line: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AccountIdentification {
    pub iban: String,
    pub ccy: String, // Currency (USD, EUR, TRY)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentIdentification {
    pub instr_id: String,
    pub end_to_end_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Amount {
    pub instd_amt: f64,
    pub ccy: String,
}

// --- Compliance (Uyum) ---
// KYC ve AML kontrolleri için yapılar

#[derive(Debug, Serialize, Deserialize)]
pub struct KYCRecord {
    pub user_id: String,
    pub document_hash: String, // IPFS veya Güvenli Depo Hash'i
    pub risk_score: u8, // 0-100 arası risk skoru
    pub status: KYCStatus,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum KYCStatus {
    Pending,
    Verified,
    Rejected,
    EnhancedDueDiligence, // Yüksek riskli işlemler için
}
