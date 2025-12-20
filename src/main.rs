mod api;
mod contracts;
mod crypto;
mod db;
mod models;
mod network;
mod vm;
mod compliance;
mod ai;
mod qrc20;
mod exchange;
mod wallet;
mod developer;
mod mobile;

use actix_web::{web, App, HttpServer};
use db::Database;
use actix_cors::Cors;
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;
use crate::network::P2PNode;
use crate::vm::QVM;
use crate::ai::QMind;

// Shared State
pub struct AppState {
    pub db: Database,
    pub vm: Arc<Mutex<QVM>>,
    pub ai: Arc<Mutex<QMind>>, // AI Motoru Eklendi
    pub network_tx: mpsc::Sender<String>, 
    pub connected_peers: Arc<Mutex<Vec<String>>>,
}

#[tokio::main]
async fn main() -> std::io::Result<()> {
    println!("🌌 Q-Verse Core: Quantum-Safe Hybrid Finance Network");
    println!("---------------------------------------------------");
    
    // 1. Initialize Database
    println!("🔌 Connecting to Ledger...");
    let db = Database::connect().await.expect("Failed to connect to DB");
    db.init_schema().await.expect("Failed to init schema");

    // 2. Initialize Engines
    println!("🧠 Initializing Q-VM & Q-Mind AI...");
    let vm = Arc::new(Mutex::new(QVM::new()));
    let ai = Arc::new(Mutex::new(QMind::new()));

    // 3. Start P2P Network
    println!("🌐 Bootstrapping P2P Network...");
    let mut p2p_node = P2PNode::new(None).await.expect("Failed to create P2P node");
    
    let (tx, _rx) = mpsc::channel(32); 
    
    tokio::spawn(async move {
        if let Err(e) = p2p_node.start().await {
            eprintln!("❌ P2P Network Error: {}", e);
        }
    });

    let connected_peers = Arc::new(Mutex::new(vec!["12D3KooW...".to_string()]));

    let app_state = web::Data::new(AppState {
        db,
        vm,
        ai,
        network_tx: tx,
        connected_peers,
    });

    // 4. Start API Server
    println!("🚀 Starting API Server at http://127.0.0.1:8080");
    
    HttpServer::new(move || {
        let cors = Cors::permissive();

        App::new()
            .wrap(cors)
            .app_data(app_state.clone())
            .app_data(web::Data::new(app_state.db.clone())) 
            .configure(api::config)
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
