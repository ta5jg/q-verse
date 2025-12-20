use serde::{Serialize, Deserialize};

// --- QRC-20 Token Standardı ---
// USDTgVerse'nin standart token yapısından çok daha gelişmiş,
// Kuantum Güvenli ve Regülasyon Uyumlu yeni nesil standart.

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct QRC20Token {
    pub name: String,
    pub symbol: String,
    pub total_supply: f64,
    pub decimals: u8,
    
    // Q-Verse Farkı 1: Kuantum İmza Zorunluluğu
    pub quantum_secured: bool, // Dilithium5 imzası şart mı?
    
    // Q-Verse Farkı 2: Regülasyon Kancaları (Regulatory Hooks)
    // Token transferlerinde KYC kontrolü zorunlu mu?
    pub compliance_required: bool,
    
    // Q-Verse Farkı 3: Varlık Destek Bilgisi (RWA - Real World Asset)
    // Eğer bu bir stabil coin veya altın tokenı ise, dayanak varlık bilgisi.
    pub asset_backing: Option<AssetBacking>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssetBacking {
    pub asset_type: String, // "FIAT", "GOLD", "REAL_ESTATE"
    pub audit_report_hash: String, // Denetim raporunun IPFS hash'i
    pub oracle_feed_id: String, // Fiyatı doğrulayan Oracle ID
}

impl QRC20Token {
    pub fn new_standard(name: &str, symbol: &str, supply: f64) -> Self {
        Self {
            name: name.to_string(),
            symbol: symbol.to_string(),
            total_supply: supply,
            decimals: 18,
            quantum_secured: true, // Varsayılan olarak kuantum güvenli
            compliance_required: false,
            asset_backing: None,
        }
    }

    pub fn new_stablecoin(name: &str, symbol: &str, supply: f64, backing: AssetBacking) -> Self {
        Self {
            name: name.to_string(),
            symbol: symbol.to_string(),
            total_supply: supply,
            decimals: 6,
            quantum_secured: true,
            compliance_required: true, // Stabil coinlerde uyum şart
            asset_backing: Some(backing),
        }
    }
}
