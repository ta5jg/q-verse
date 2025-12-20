use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
use tokio::sync::RwLock;
use serde::Serialize;

#[derive(Clone, Default)]
pub struct Metrics {
    pub total_requests: Arc<AtomicU64>,
    pub successful_requests: Arc<AtomicU64>,
    pub failed_requests: Arc<AtomicU64>,
    pub total_transactions: Arc<AtomicU64>,
    pub total_swaps: Arc<AtomicU64>,
    pub total_bridge_transactions: Arc<AtomicU64>,
    pub active_connections: Arc<AtomicU64>,
    pub response_times: Arc<RwLock<Vec<u64>>>, // milliseconds
}

impl Metrics {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn increment_requests(&self) {
        self.total_requests.fetch_add(1, Ordering::Relaxed);
    }

    pub fn increment_success(&self) {
        self.successful_requests.fetch_add(1, Ordering::Relaxed);
    }

    pub fn increment_failure(&self) {
        self.failed_requests.fetch_add(1, Ordering::Relaxed);
    }

    pub fn increment_transactions(&self) {
        self.total_transactions.fetch_add(1, Ordering::Relaxed);
    }

    pub fn increment_swaps(&self) {
        self.total_swaps.fetch_add(1, Ordering::Relaxed);
    }

    pub fn increment_bridge(&self) {
        self.total_bridge_transactions.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_response_time(&self, ms: u64) {
        let mut times = self.response_times.try_write();
        if let Ok(mut t) = times {
            t.push(ms);
            // Keep only last 1000 response times
            if t.len() > 1000 {
                t.remove(0);
            }
        }
    }

    pub fn get_stats(&self) -> MetricsStats {
        let times = self.response_times.try_read().unwrap_or_default();
        let avg_response_time = if times.is_empty() {
            0.0
        } else {
            times.iter().sum::<u64>() as f64 / times.len() as f64
        };

        MetricsStats {
            total_requests: self.total_requests.load(Ordering::Relaxed),
            successful_requests: self.successful_requests.load(Ordering::Relaxed),
            failed_requests: self.failed_requests.load(Ordering::Relaxed),
            total_transactions: self.total_transactions.load(Ordering::Relaxed),
            total_swaps: self.total_swaps.load(Ordering::Relaxed),
            total_bridge_transactions: self.total_bridge_transactions.load(Ordering::Relaxed),
            active_connections: self.active_connections.load(Ordering::Relaxed),
            avg_response_time_ms: avg_response_time,
            success_rate: if self.total_requests.load(Ordering::Relaxed) > 0 {
                (self.successful_requests.load(Ordering::Relaxed) as f64 
                    / self.total_requests.load(Ordering::Relaxed) as f64) * 100.0
            } else {
                0.0
            },
        }
    }
}

#[derive(Debug, Serialize)]
pub struct MetricsStats {
    pub total_requests: u64,
    pub successful_requests: u64,
    pub failed_requests: u64,
    pub total_transactions: u64,
    pub total_swaps: u64,
    pub total_bridge_transactions: u64,
    pub active_connections: u64,
    pub avg_response_time_ms: f64,
    pub success_rate: f64,
}
