/* ==============================================
 * File:        src/cache.rs
 * Author:      USDTG GROUP TECHNOLOGY LLC
 * Developer:   Irfan Gedik
 * Created Date: 2025-12-22
 * Last Update:  2025-12-22
 * Version:     1.0.0
 *
 * Description:
 *   In-Memory Cache Module
 *
 *   Provides TTL-based caching for prices, pools, and blocks.
 *   Supports automatic expiration and cleanup of expired entries.
 *
 * License:
 *   MIT License
 * ============================================== */

use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use serde::{Serialize, Deserialize};

#[derive(Clone, Debug)]
struct CacheEntry<T> {
    data: T,
    expires_at: Instant,
}

/// In-memory cache with TTL support
#[derive(Clone)]
pub struct Cache<T> {
    entries: Arc<RwLock<HashMap<String, CacheEntry<T>>>>,
    default_ttl: Duration,
}

impl<T: Clone> Cache<T> {
    pub fn new(default_ttl_seconds: u64) -> Self {
        Self {
            entries: Arc::new(RwLock::new(HashMap::new())),
            default_ttl: Duration::from_secs(default_ttl_seconds),
        }
    }

    pub async fn get(&self, key: &str) -> Option<T> {
        let entries = self.entries.read().await;
        if let Some(entry) = entries.get(key) {
            if Instant::now() < entry.expires_at {
                return Some(entry.data.clone());
            }
        }
        None
    }

    pub async fn set(&self, key: String, value: T) {
        self.set_with_ttl(key, value, self.default_ttl).await;
    }

    pub async fn set_with_ttl(&self, key: String, value: T, ttl: Duration) {
        let mut entries = self.entries.write().await;
        entries.insert(
            key,
            CacheEntry {
                data: value,
                expires_at: Instant::now() + ttl,
            },
        );
    }

    pub async fn remove(&self, key: &str) {
        let mut entries = self.entries.write().await;
        entries.remove(key);
    }

    pub async fn clear(&self) {
        let mut entries = self.entries.write().await;
        entries.clear();
    }

    pub async fn cleanup_expired(&self) {
        let now = Instant::now();
        let mut entries = self.entries.write().await;
        entries.retain(|_, entry| entry.expires_at > now);
    }
}

/// Cache manager for different data types
#[derive(Clone)]
pub struct CacheManager {
    pub prices: Cache<f64>,
    pub pools: Cache<serde_json::Value>,
    pub blocks: Cache<serde_json::Value>,
}

impl CacheManager {
    pub fn new() -> Self {
        Self {
            prices: Cache::new(5),      // 5 seconds for prices
            pools: Cache::new(30),      // 30 seconds for pools
            blocks: Cache::new(60),     // 60 seconds for blocks
        }
    }
}

impl Default for CacheManager {
    fn default() -> Self {
        Self::new()
    }
}
