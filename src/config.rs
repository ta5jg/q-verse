/* ==============================================
 * File:        src/config.rs
 * Author:      USDTG GROUP TECHNOLOGY LLC
 * Developer:   Irfan Gedik
 * Created Date: 2025-12-22
 * Last Update:  2025-12-22
 * Version:     1.0.0
 *
 * Description:
 *   Configuration Management Module
 *
 *   Loads and manages application configuration from environment
 *   variables. Handles database URL, API ports, CORS settings, etc.
 *
 * License:
 *   MIT License
 * ============================================== */

use std::env;
use dotenv::dotenv;

#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub api_port: u16,
    pub api_host: String,
    pub rust_log: String,
    pub node_id: Option<String>,
    pub enable_cors: bool,
    pub max_connections: u32,
}

impl Config {
    pub fn load() -> Self {
        dotenv().ok();

        Self {
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "sqlite:qverse.db?mode=rwc".to_string()),
            api_port: env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .unwrap_or(8080),
            api_host: env::var("API_HOST")
                .unwrap_or_else(|_| "0.0.0.0".to_string()),
            rust_log: env::var("RUST_LOG")
                .unwrap_or_else(|_| "info".to_string()),
            node_id: env::var("NODE_ID").ok(),
            enable_cors: env::var("ENABLE_CORS")
                .unwrap_or_else(|_| "true".to_string())
                .parse()
                .unwrap_or(true),
            max_connections: env::var("MAX_CONNECTIONS")
                .unwrap_or_else(|_| "5".to_string())
                .parse()
                .unwrap_or(5),
        }
    }

    pub fn bind_address(&self) -> String {
        format!("{}:{}", self.api_host, self.api_port)
    }
}
