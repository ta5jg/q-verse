use std::error::Error;
use uuid::Uuid;

/// Validates wallet ID format
pub fn validate_wallet_id(wallet_id: &Uuid) -> Result<(), Box<dyn Error>> {
    if wallet_id.is_nil() {
        return Err("Invalid wallet ID: cannot be nil".into());
    }
    Ok(())
}

/// Validates token symbol
pub fn validate_token_symbol(token: &str) -> Result<(), Box<dyn Error>> {
    if token.is_empty() {
        return Err("Token symbol cannot be empty".into());
    }
    if token.len() > 10 {
        return Err("Token symbol too long (max 10 characters)".into());
    }
    Ok(())
}

/// Validates amount (must be positive)
pub fn validate_amount(amount: f64) -> Result<(), Box<dyn Error>> {
    if amount <= 0.0 {
        return Err("Amount must be positive".into());
    }
    if amount > 1_000_000_000_000.0 {
        return Err("Amount too large".into());
    }
    if amount.is_nan() || amount.is_infinite() {
        return Err("Invalid amount value".into());
    }
    Ok(())
}

/// Validates price (must be positive)
pub fn validate_price(price: f64) -> Result<(), Box<dyn Error>> {
    if price <= 0.0 {
        return Err("Price must be positive".into());
    }
    if price.is_nan() || price.is_infinite() {
        return Err("Invalid price value".into());
    }
    Ok(())
}

/// Validates address format
pub fn validate_address(address: &str) -> Result<(), Box<dyn Error>> {
    if address.is_empty() {
        return Err("Address cannot be empty".into());
    }
    if address.len() < 10 || address.len() > 128 {
        return Err("Invalid address format".into());
    }
    Ok(())
}

/// Validates username
pub fn validate_username(username: &str) -> Result<(), Box<dyn Error>> {
    if username.is_empty() {
        return Err("Username cannot be empty".into());
    }
    if username.len() < 3 || username.len() > 32 {
        return Err("Username must be between 3 and 32 characters".into());
    }
    if !username.chars().all(|c| c.is_alphanumeric() || c == '_' || c == '-') {
        return Err("Username can only contain alphanumeric characters, underscores, and hyphens".into());
    }
    Ok(())
}

/// Validates proposal title
pub fn validate_proposal_title(title: &str) -> Result<(), Box<dyn Error>> {
    if title.is_empty() {
        return Err("Proposal title cannot be empty".into());
    }
    if title.len() > 200 {
        return Err("Proposal title too long (max 200 characters)".into());
    }
    Ok(())
}

/// Validates proposal description
pub fn validate_proposal_description(desc: &str) -> Result<(), Box<dyn Error>> {
    if desc.is_empty() {
        return Err("Proposal description cannot be empty".into());
    }
    if desc.len() > 5000 {
        return Err("Proposal description too long (max 5000 characters)".into());
    }
    Ok(())
}

/// Validates pair format (e.g., "QVR/USDT")
pub fn validate_pair(pair: &str) -> Result<(), Box<dyn Error>> {
    if pair.is_empty() {
        return Err("Pair cannot be empty".into());
    }
    let parts: Vec<&str> = pair.split('/').collect();
    if parts.len() != 2 {
        return Err("Invalid pair format. Expected: TOKEN1/TOKEN2".into());
    }
    validate_token_symbol(parts[0])?;
    validate_token_symbol(parts[1])?;
    Ok(())
}

/// Validates order side
pub fn validate_order_side(side: &str) -> Result<(), Box<dyn Error>> {
    match side.to_uppercase().as_str() {
        "BUY" | "SELL" => Ok(()),
        _ => Err("Invalid order side. Must be 'BUY' or 'SELL'".into()),
    }
}

/// Validates order type
pub fn validate_order_type(order_type: &str) -> Result<(), Box<dyn Error>> {
    match order_type.to_uppercase().as_str() {
        "MARKET" | "LIMIT" | "STOPLOSS" => Ok(()),
        _ => Err("Invalid order type. Must be 'MARKET', 'LIMIT', or 'STOPLOSS'".into()),
    }
}

/// Validates vote type
pub fn validate_vote_type(vote_type: &str) -> Result<(), Box<dyn Error>> {
    match vote_type.to_uppercase().as_str() {
        "FOR" | "AGAINST" | "ABSTAIN" => Ok(()),
        _ => Err("Invalid vote type. Must be 'FOR', 'AGAINST', or 'ABSTAIN'".into()),
    }
}

/// Validates chain name
pub fn validate_chain_name(chain: &str) -> Result<(), Box<dyn Error>> {
    let valid_chains = ["ethereum", "bnb", "solana", "tron", "avalanche", "polygon", "q-verse"];
    if !valid_chains.contains(&chain.to_lowercase().as_str()) {
        return Err(format!("Invalid chain. Supported: {}", valid_chains.join(", ")).into());
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_amount() {
        assert!(validate_amount(100.0).is_ok());
        assert!(validate_amount(0.0).is_err());
        assert!(validate_amount(-10.0).is_err());
    }

    #[test]
    fn test_validate_username() {
        assert!(validate_username("alice123").is_ok());
        assert!(validate_username("ab").is_err()); // Too short
        assert!(validate_username("a".repeat(33)).is_err()); // Too long
    }

    #[test]
    fn test_validate_pair() {
        assert!(validate_pair("QVR/USDT").is_ok());
        assert!(validate_pair("QVR").is_err()); // Missing separator
    }
}
