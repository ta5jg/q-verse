use actix_web::{HttpResponse, ResponseError};
use serde::Serialize;
use std::fmt;

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub success: bool,
    pub error: String,
    pub code: Option<String>,
}

#[derive(Debug)]
pub enum ApiError {
    ValidationError(String),
    NotFound(String),
    Unauthorized(String),
    InsufficientFunds(String),
    DatabaseError(String),
    InternalError(String),
}

impl fmt::Display for ApiError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ApiError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
            ApiError::NotFound(msg) => write!(f, "Not found: {}", msg),
            ApiError::Unauthorized(msg) => write!(f, "Unauthorized: {}", msg),
            ApiError::InsufficientFunds(msg) => write!(f, "Insufficient funds: {}", msg),
            ApiError::DatabaseError(msg) => write!(f, "Database error: {}", msg),
            ApiError::InternalError(msg) => write!(f, "Internal error: {}", msg),
        }
    }
}

impl ResponseError for ApiError {
    fn error_response(&self) -> HttpResponse {
        let (status, code) = match self {
            ApiError::ValidationError(_) => (actix_web::http::StatusCode::BAD_REQUEST, "VALIDATION_ERROR"),
            ApiError::NotFound(_) => (actix_web::http::StatusCode::NOT_FOUND, "NOT_FOUND"),
            ApiError::Unauthorized(_) => (actix_web::http::StatusCode::UNAUTHORIZED, "UNAUTHORIZED"),
            ApiError::InsufficientFunds(_) => (actix_web::http::StatusCode::BAD_REQUEST, "INSUFFICIENT_FUNDS"),
            ApiError::DatabaseError(_) => (actix_web::http::StatusCode::INTERNAL_SERVER_ERROR, "DATABASE_ERROR"),
            ApiError::InternalError(_) => (actix_web::http::StatusCode::INTERNAL_SERVER_ERROR, "INTERNAL_ERROR"),
        };

        HttpResponse::build(status).json(ErrorResponse {
            success: false,
            error: self.to_string(),
            code: Some(code.to_string()),
        })
    }
}

impl From<sqlx::Error> for ApiError {
    fn from(err: sqlx::Error) -> Self {
        log::error!("Database error: {}", err);
        ApiError::DatabaseError("Database operation failed".to_string())
    }
}

impl From<Box<dyn std::error::Error>> for ApiError {
    fn from(err: Box<dyn std::error::Error>) -> Self {
        ApiError::InternalError(err.to_string())
    }
}
