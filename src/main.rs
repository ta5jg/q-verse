/* ==============================================
 * File:        src/main.rs
 * Author:      USDTG GROUP TECHNOLOGY LLC
 * Developer:   Irfan Gedik
 * Created Date: 2025-12-22
 * Last Update:  2025-12-22
 * Version:     1.0.0
 *
 * Description:
 *   Q-Verse Core Main Entry
 *   
 *   Main application entry point, server initialization,
 *   and dependency injection setup.
 *
 * License:
 *   MIT License
 * ============================================== */

use actix_web::{web, App, HttpServer, middleware::Logger, middleware::Compress};
use actix_cors::Cors;
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;
// use q_verse_core::network::P2PNode; // Temporarily disabled
use q_verse_core::{Database, QVM, QMind, CacheManager, Metrics, RateLimiter, RequestIdMiddleware, SecurityHeadersMiddleware, AppState, config};

#[tokio::main]
async fn main() -> std::io::Result<()> {
    // Load configuration
    let config = config::Config::load();
    
    // Initialize logger
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or(&config.rust_log))
        .init();
    
    log::info!("🌌 Q-Verse Core: Quantum-Safe Hybrid Finance Network");
    log::info!("---------------------------------------------------");
    
    // 1. Initialize Database
    log::info!("🔌 Connecting to Ledger...");
    let db = Database::connect_with_url(&config.database_url, config.max_connections)
        .await
        .expect("Failed to connect to DB");
    db.init_schema().await.expect("Failed to init schema");
    log::info!("✅ Database connected and schema initialized");

    // 2. Initialize Engines
    log::info!("🧠 Initializing Q-VM & Q-Mind AI...");
    let vm = Arc::new(Mutex::new(QVM::new()));
    let ai = Arc::new(Mutex::new(QMind::new()));
    log::info!("✅ Q-VM and Q-Mind initialized");

    // 2.5. Initialize Cache & Metrics
    log::info!("📊 Initializing Cache & Metrics...");
    let cache = CacheManager::new();
    let metrics = Metrics::new();
    let rate_limiter = RateLimiter::new(1000, 60); // 1000 requests per minute
    log::info!("✅ Cache & Metrics initialized");

    // 3. Start P2P Network (Temporarily disabled)
    // log::info!("🌐 Bootstrapping P2P Network...");
    // let mut p2p_node = P2PNode::new(config.node_id.as_deref()).await
    //     .expect("Failed to create P2P node");
    
    let (tx, _rx) = mpsc::channel(32); 
    
    // tokio::spawn(async move {
    //     if let Err(e) = p2p_node.start().await {
    //         log::error!("❌ P2P Network Error: {}", e);
    //     }
    // });
    // log::info!("✅ P2P Network started");
    log::info!("⚠️  P2P Network temporarily disabled");

    let connected_peers = Arc::new(Mutex::new(vec![]));

    let app_state = web::Data::new(AppState {
        db: db.clone(),
        vm,
        ai,
        network_tx: tx,
        connected_peers,
        cache: cache.clone(),
        metrics: metrics.clone(),
        rate_limiter: rate_limiter.clone(),
    });

    // Start cache cleanup task
    let cache_clone = cache.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(60));
        loop {
            interval.tick().await;
            cache_clone.prices.cleanup_expired().await;
            cache_clone.pools.cleanup_expired().await;
            cache_clone.blocks.cleanup_expired().await;
        }
    });

    // 4. Start API Server
    let bind_addr = config.bind_address();
    log::info!("🚀 Starting API Server at http://{}", bind_addr);
    log::info!("🛡️  Security: Rate limiting enabled (1000 req/min)");
    log::info!("⚡ Performance: Caching enabled");
    log::info!("📊 Monitoring: Metrics collection enabled");
    
    HttpServer::new(move || {
        let cors = if config.enable_cors {
            Cors::permissive()
        } else {
            Cors::default()
        };

        App::new()
            .wrap(Compress::default())
            .wrap(Logger::default())
            .wrap(SecurityHeadersMiddleware)
            .wrap(RequestIdMiddleware)
            .wrap(cors)
            .app_data(app_state.clone())
            .app_data(web::Data::new(app_state.db.clone()))
            .app_data(web::Data::new(app_state.cache.clone()))
            .app_data(web::Data::new(app_state.metrics.clone()))
            .app_data(web::Data::new(app_state.rate_limiter.clone()))
            .service(q_verse_core::openapi::swagger_ui())
            .configure(q_verse_core::api::config)
    })
    .bind(&bind_addr)?
    .workers(num_cpus::get().min(8)) // Use up to 8 CPU cores for optimal performance
    .run()
    .await
}
