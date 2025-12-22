/* ==============================================
 * File:        src/lib.rs
 * Author:      USDTG GROUP TECHNOLOGY LLC
 * Developer:   Irfan Gedik
 * Created Date: 2025-12-22
 * Last Update:  2025-12-22
 * Version:     1.0.0
 *
 * Description:
 *   Q-Verse Core Library Definition
 *   
 *   Module exports, shared state definitions, and
 *   core library logic.
 *
 * License:
 *   MIT License
 * ============================================== */

pub mod api;
pub mod contracts;
pub mod crypto;
pub mod db;
pub mod models;
// pub mod network; // Temporarily disabled due to libp2p compatibility issues 
pub mod vm;      
pub mod compliance;
pub mod ai; // Yeni: Yapay Zeka
pub mod qrc20; // Yeni: Token Standardı
pub mod exchange;
pub mod wallet;
pub mod developer;
pub mod mobile;
pub mod config;
pub mod validation;
pub mod errors;
pub mod middleware;
pub mod cache;
pub mod metrics;
pub mod batch;
pub mod websocket;
pub mod openapi;

use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;

// Re-export commonly used types for easier access
pub use db::Database;
pub use vm::QVM;
pub use ai::QMind;
pub use cache::CacheManager;
pub use metrics::Metrics;
pub use middleware::{RateLimiter, RequestIdMiddleware, SecurityHeadersMiddleware};

// Shared State - moved from main.rs to lib.rs so api.rs can access it
pub struct AppState {
    pub db: Database,
    pub vm: Arc<Mutex<QVM>>,
    pub ai: Arc<Mutex<QMind>>,
    pub network_tx: mpsc::Sender<String>, 
    pub connected_peers: Arc<Mutex<Vec<String>>>,
    pub cache: CacheManager,
    pub metrics: Metrics,
    pub rate_limiter: RateLimiter,
}
