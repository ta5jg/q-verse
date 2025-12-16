mod api;
mod contracts;
mod crypto;
mod db;
mod models;

use actix_web::{web, App, HttpServer};
use db::Database;
use actix_cors::Cors;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    println!("🌌 Q-Verse Core: Quantum-Safe Hybrid Finance Network");
    println!("---------------------------------------------------");
    
    // 1. Initialize Database
    println!("🔌 Connecting to Ledger...");
    let db = Database::connect().await.expect("Failed to connect to DB");
    db.init_schema().await.expect("Failed to init schema");
    let db_data = web::Data::new(db);

    // 2. Start API Server
    println!("🚀 Starting API Server at http://127.0.0.1:8080");
    
    HttpServer::new(move || {
        let cors = Cors::permissive();

        App::new()
            .wrap(cors)
            .app_data(db_data.clone())
            .configure(api::config)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
