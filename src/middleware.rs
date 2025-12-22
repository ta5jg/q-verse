use actix_web::{dev::ServiceRequest, Error, HttpMessage};
use actix_web::dev::{Service, Transform};
use actix_web::web::Data;
use futures::future::{ready, Ready};
use futures::Future;
use std::cell::RefCell;
use std::pin::Pin;
use std::rc::Rc;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use log;

/// Rate Limiter - Token Bucket Algorithm
#[derive(Clone)]
pub struct RateLimiter {
    requests: Arc<RwLock<std::collections::HashMap<String, Vec<Instant>>>>,
    max_requests: usize,
    window: Duration,
}

impl RateLimiter {
    pub fn new(max_requests: usize, window_seconds: u64) -> Self {
        Self {
            requests: Arc::new(RwLock::new(std::collections::HashMap::new())),
            max_requests,
            window: Duration::from_secs(window_seconds),
        }
    }

    pub async fn check(&self, key: &str) -> bool {
        let mut requests = self.requests.write().await;
        let now = Instant::now();
        
        // Clean old requests
        if let Some(timestamps) = requests.get_mut(key) {
            timestamps.retain(|&t| now.duration_since(t) < self.window);
            
            if timestamps.len() >= self.max_requests {
                log::warn!("Rate limit exceeded for key: {}", key);
                return false;
            }
            
            timestamps.push(now);
        } else {
            requests.insert(key.to_string(), vec![now]);
        }
        
        true
    }
}

/// Request ID Middleware - Track requests
pub struct RequestIdMiddleware;

impl<S, B> Transform<S, ServiceRequest> for RequestIdMiddleware
where
    S: Service<ServiceRequest, Response = actix_web::dev::ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = actix_web::dev::ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = RequestIdMiddlewareService<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(RequestIdMiddlewareService {
            service: Rc::new(RefCell::new(service)),
        }))
    }
}

pub struct RequestIdMiddlewareService<S> {
    service: Rc<RefCell<S>>,
}

impl<S, B> Service<ServiceRequest> for RequestIdMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = actix_web::dev::ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = actix_web::dev::ServiceResponse<B>;
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    fn poll_ready(&self, ctx: &mut std::task::Context<'_>) -> std::task::Poll<Result<(), Self::Error>> {
        self.service.borrow().poll_ready(ctx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let request_id = uuid::Uuid::new_v4().to_string();
        req.extensions_mut().insert::<String>(request_id.clone());
        
        log::debug!("Request ID: {} - {} {}", request_id, req.method(), req.path());
        
        let service = self.service.clone();
        Box::pin(async move {
            let fut = service.borrow_mut().call(req);
            fut.await
        })
    }
}

/// Security Headers Middleware
pub struct SecurityHeadersMiddleware;

impl<S, B> Transform<S, ServiceRequest> for SecurityHeadersMiddleware
where
    S: Service<ServiceRequest, Response = actix_web::dev::ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = actix_web::dev::ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = SecurityHeadersService<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(SecurityHeadersService {
            service: Rc::new(RefCell::new(service)),
        }))
    }
}

pub struct SecurityHeadersService<S> {
    service: Rc<RefCell<S>>,
}

impl<S, B> Service<ServiceRequest> for SecurityHeadersService<S>
where
    S: Service<ServiceRequest, Response = actix_web::dev::ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = actix_web::dev::ServiceResponse<B>;
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let service = self.service.clone();
        Box::pin(async move {
            let mut res = service.borrow_mut().call(req).await?;
            
            // Add security headers
            res.headers_mut().insert(
                actix_web::http::header::HeaderName::from_static("x-content-type-options"),
                actix_web::http::HeaderValue::from_static("nosniff"),
            );
            res.headers_mut().insert(
                actix_web::http::header::HeaderName::from_static("x-frame-options"),
                actix_web::http::HeaderValue::from_static("DENY"),
            );
            res.headers_mut().insert(
                actix_web::http::header::HeaderName::from_static("x-xss-protection"),
                actix_web::http::HeaderValue::from_static("1; mode=block"),
            );
            res.headers_mut().insert(
                actix_web::http::header::HeaderName::from_static("strict-transport-security"),
                actix_web::http::HeaderValue::from_static("max-age=31536000; includeSubDomains"),
            );
            
            Ok(res)
        })
    }
}
