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
use crate::vm::QVM;
use crate::ai::QMind;
use crate::cache::CacheManager;
use crate::metrics::Metrics;
use crate::middleware::RateLimiter;
use crate::db::Database;

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
