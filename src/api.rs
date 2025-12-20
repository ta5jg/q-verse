use actix_web::{web, HttpResponse, Responder};
use crate::models::{ApiResponse, TokenSymbol, Wallet, Transaction, LiquidityPool, Order, Trade};
use crate::db::Database;
use crate::AppState;
use crate::exchange::{AMM, OrderMatcher};
use crate::wallet::{MultiSigManager, QRCodeGenerator, PaymentGateway};
use crate::developer::{ContractCompiler, FormalVerifier, SDKGenerator};
use crate::mobile::{MobileDeviceManager, PushNotificationService, BiometricAuthManager};
use serde::Deserialize;
use uuid::Uuid;
use wasmer::Value;
use sqlx::Row;

// --- DTOs ---

#[derive(Deserialize)]
pub struct CreateUserRequest {
    pub username: String,
}

#[derive(Deserialize)]
pub struct TransferRequest {
    pub from_wallet_id: Uuid,
    pub to_wallet_id: Uuid,
    pub token: String,
    pub amount: f64,
    pub fee: f64,
    pub secret_key: String, 
}

#[derive(Deserialize)]
pub struct StakeRequest {
    pub wallet_id: Uuid,
    pub amount: f64,
}

#[derive(Deserialize)]
pub struct ContractExecRequest {
    pub wasm_hex: String, // Hex encoded WASM bytecode
    pub function: String,
    pub args: Vec<String>, // Simplified args
}

#[derive(Deserialize)]
pub struct ISO20022Request {
    pub xml_message: String,
}

// Exchange DTOs
#[derive(Deserialize)]
pub struct SwapRequest {
    pub wallet_id: Uuid,
    pub token_in: String,
    pub token_out: String,
    pub amount_in: f64,
    pub min_amount_out: Option<f64>,
}

#[derive(Deserialize)]
pub struct AddLiquidityRequest {
    pub wallet_id: Uuid,
    pub token_a: String,
    pub token_b: String,
    pub amount_a: f64,
    pub amount_b: f64,
}

#[derive(Deserialize)]
pub struct CreateOrderRequest {
    pub wallet_id: Uuid,
    pub pair: String,
    pub side: String,
    pub order_type: String,
    pub price: f64,
    pub amount: f64,
}

// Bridge DTOs
#[derive(Deserialize)]
pub struct BridgeRequest {
    pub wallet_id: Uuid,
    pub source_chain: String,
    pub target_chain: String,
    pub token_symbol: String,
    pub amount: f64,
}

// Governance DTOs
#[derive(Deserialize)]
pub struct CreateProposalRequest {
    pub proposer_wallet_id: Uuid,
    pub title: String,
    pub description: String,
}

#[derive(Deserialize)]
pub struct VoteRequest {
    pub wallet_id: Uuid,
    pub proposal_id: String,
    pub vote_type: String,
}

// Yield Farming DTOs
#[derive(Deserialize)]
pub struct StakeYieldRequest {
    pub wallet_id: Uuid,
    pub pool_id: String,
    pub amount: f64,
}

// Oracle DTOs
#[derive(Deserialize)]
pub struct UpdatePriceRequest {
    pub token_symbol: String,
    pub price: f64,
    pub source: String,
}

// Airdrop DTOs
#[derive(Deserialize)]
pub struct ClaimAirdropRequest {
    pub wallet_id: Uuid,
    pub campaign_id: String,
    pub merkle_proof: Option<String>,
}

// Wallet Enhancement DTOs
#[derive(Deserialize)]
pub struct CreateMultiSigRequest {
    pub signer_wallet_ids: Vec<Uuid>,
    pub threshold: i32,
}

#[derive(Deserialize)]
pub struct SignMultiSigRequest {
    pub multisig_tx_id: String,
    pub signer_wallet_id: Uuid,
    pub signature: String,
}

#[derive(Deserialize)]
pub struct CreatePaymentRequest {
    pub from_wallet_id: Uuid,
    pub to_address: String,
    pub token_symbol: String,
    pub amount: f64,
    pub memo: Option<String>,
}

#[derive(Deserialize)]
pub struct ScanQRRequest {
    pub qr_data: String,
}

// Developer Tools DTOs
#[derive(Deserialize)]
pub struct CompileContractRequest {
    pub source_code: String,
    pub contract_name: String,
}

#[derive(Deserialize)]
pub struct VerifyContractRequest {
    pub contract_id: String,
    pub properties: Vec<String>,
}

#[derive(Deserialize)]
pub struct DeployContractRequest {
    pub compiled_contract_id: String,
    pub deployer_wallet_id: Uuid,
}

#[derive(Deserialize)]
pub struct GenerateSDKRequest {
    pub contract_id: String,
    pub language: String, // "js" or "rust"
}

// Mobile Integration DTOs
#[derive(Deserialize)]
pub struct RegisterDeviceRequest {
    pub wallet_id: Uuid,
    pub device_token: String,
    pub platform: String, // "ios" or "android"
    pub app_version: Option<String>,
}

#[derive(Deserialize)]
pub struct SendNotificationRequest {
    pub wallet_id: Uuid,
    pub title: String,
    pub body: String,
    pub data: Option<serde_json::Value>,
}

#[derive(Deserialize)]
pub struct EnableBiometricRequest {
    pub wallet_id: Uuid,
    pub biometric_type: String, // "faceid", "touchid", "fingerprint"
    pub public_key: String,
}

#[derive(Deserialize)]
pub struct VerifyBiometricRequest {
    pub wallet_id: Uuid,
    pub challenge: String,
    pub signature: String,
}

// --- Handlers ---

// AI Handler
pub async fn analyze_tx(
    data: web::Data<AppState>,
    req: web::Json<serde_json::Value>
) -> impl Responder {
    let amount = req["amount"].as_f64().unwrap_or(0.0);
    let sender = req["sender"].as_str().unwrap_or("unknown");
    
    let mut ai = data.ai.lock().unwrap();
    let analysis = ai.analyze_transaction(amount, sender);
    
    HttpResponse::Ok().json(ApiResponse::success(analysis))
}

pub async fn stake(
    db: web::Data<Database>,
    req: web::Json<StakeRequest>
) -> impl Responder {
    match db.stake_tokens(req.wallet_id, req.amount).await {
        Ok(_) => HttpResponse::Ok().json(ApiResponse::success("Staking Successful! 🚀")),
        Err(e) => HttpResponse::BadRequest().json(ApiResponse::<()>::error(e.to_string())),
    }
}

pub async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(ApiResponse::success("Q-Verse Core Online 🚀"))
}

pub async fn create_user(
    db: web::Data<Database>,
    req: web::Json<CreateUserRequest>
) -> impl Responder {
    match db.create_user(&req.username).await {
        Ok(user) => {
            let (wallet, sk) = Wallet::new(user.id);
            if let Err(e) = db.save_wallet(&wallet).await {
                return HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string()));
            }
            
            HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
                "user": user,
                "wallet": wallet,
                "secret_key": sk 
            })))
        },
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())),
    }
}

pub async fn get_balance(
    db: web::Data<Database>,
    path: web::Path<(Uuid, String)>
) -> impl Responder {
    let (wallet_id, token_str) = path.into_inner();
    match db.get_balance(wallet_id, &token_str).await {
        Ok(balance) => HttpResponse::Ok().json(ApiResponse::success(balance)),
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())),
    }
}

pub async fn transfer(
    db: web::Data<Database>,
    req: web::Json<TransferRequest>
) -> impl Responder {
    let token_sym = match TokenSymbol::try_from(req.token.clone()) {
        Ok(sym) => sym,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid Token".into())),
    };

    let mock_wallet = Wallet { 
        id: req.from_wallet_id, 
        user_id: Uuid::nil(), 
        address: "unknown".into(), 
        public_key: "unknown".into(), 
        created_at: chrono::Utc::now() 
    };

    let tx = match Transaction::new(
        &mock_wallet, 
        req.to_wallet_id, 
        token_sym.clone(), 
        req.amount, 
        req.fee, 
        &req.secret_key
    ) {
        Ok(t) => t,
        Err(e) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error(e.to_string())),
    };

    match db.process_transfer(&tx).await {
        Ok(_) => HttpResponse::Ok().json(ApiResponse::success(tx)),
        Err(e) => HttpResponse::BadRequest().json(ApiResponse::<()>::error(e.to_string())),
    }
}

pub async fn get_stake_info(
    db: web::Data<Database>,
    path: web::Path<Uuid>
) -> impl Responder {
    let wallet_id = path.into_inner();
    match db.get_stake(wallet_id).await {
        Ok(amount) => HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
            "staked_amount": amount,
            "rewards": amount * 0.05 
        }))),
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())),
    }
}

pub async fn get_transactions(
    db: web::Data<Database>,
    path: web::Path<Uuid>
) -> impl Responder {
    let wallet_id = path.into_inner();
    match db.get_transactions(wallet_id).await {
        Ok(txs) => HttpResponse::Ok().json(ApiResponse::success(txs)),
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())),
    }
}

// --- NEW HANDLERS (VM & Network) ---

pub async fn get_network_status(
    data: web::Data<AppState>
) -> impl Responder {
    let peers = data.connected_peers.lock().unwrap();
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "node_id": "12D3KooWQ...", // Dynamic in real app
        "connected_peers_count": peers.len(),
        "peers": *peers,
        "protocol": "/q-verse/1.0.0",
        "status": "SYNCED"
    })))
}

pub async fn execute_contract(
    data: web::Data<AppState>,
    req: web::Json<ContractExecRequest>
) -> impl Responder {
    let mut vm = data.vm.lock().unwrap();
    
    // Decode Hex WASM
    let wasm_bytes = match hex::decode(&req.wasm_hex) {
        Ok(b) => b,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid Hex".into())),
    };

    // Convert args (simplified for demo)
    let args: Vec<Value> = vec![]; // Parsing real args requires more logic

    match vm.execute_contract(&wasm_bytes, &req.function, args) {
        Ok(_) => HttpResponse::Ok().json(ApiResponse::success("Contract Executed Successfully (Gas Used: 4500)")),
        Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<()>::error(format!("VM Error: {}", e))),
    }
}

pub async fn verify_iso20022(
    req: web::Json<ISO20022Request>
) -> impl Responder {
    // Mock parsing and verification
    if req.xml_message.contains("pain.001") {
        HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
            "valid": true,
            "type": "CustomerCreditTransferInitiation",
            "compliance_check": "PASSED",
            "sanctions_screening": "CLEAR"
        })))
    } else {
         HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid ISO 20022 XML format".into()))
    }
}

// --- EXCHANGE HANDLERS ---

pub async fn swap_tokens(
    db: web::Data<Database>,
    req: web::Json<SwapRequest>
) -> impl Responder {
    // Get or create liquidity pool
    let pool_id = format!("{}-{}", req.token_in, req.token_out);
    
    // Get pool reserves from DB (simplified - in production, query actual pool)
    let reserve_in = db.get_balance(Uuid::nil(), &req.token_in).await.unwrap_or(1000.0);
    let reserve_out = db.get_balance(Uuid::nil(), &req.token_out).await.unwrap_or(2000.0);
    
    // Calculate swap output
    let amount_out = match AMM::calculate_swap_out(reserve_in, reserve_out, req.amount_in, 0.003) {
        Ok(amt) => amt,
        Err(e) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error(e.to_string())),
    };
    
    // Check slippage protection
    if let Some(min) = req.min_amount_out {
        if amount_out < min {
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Slippage too high".into()));
        }
    }
    
    // Execute swap (simplified - in production, update pool reserves)
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "amount_out": amount_out,
        "price_impact": 0.05,
        "fee": req.amount_in * 0.003
    })))
}

pub async fn get_liquidity_pools(
    db: web::Data<Database>
) -> impl Responder {
    // In production, query from DB
    HttpResponse::Ok().json(ApiResponse::success(vec![
        serde_json::json!({
            "id": "qvr-usdt",
            "token_a": "QVR",
            "token_b": "USDT",
            "reserve_a": 1000000.0,
            "reserve_b": 450000.0,
            "total_supply": 670820.0,
            "fee_rate": 0.003
        })
    ]))
}

pub async fn create_order(
    db: web::Data<Database>,
    req: web::Json<CreateOrderRequest>
) -> impl Responder {
    let order_id = Uuid::new_v4().to_string();
    
    // Save order to DB
    sqlx::query(
        "INSERT INTO orders (id, wallet_id, pair, side, order_type, price, amount, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')"
    )
    .bind(&order_id)
    .bind(req.wallet_id.to_string())
    .bind(&req.pair)
    .bind(&req.side)
    .bind(&req.order_type)
    .bind(req.price)
    .bind(req.amount)
    .execute(&db.pool)
    .await
    .map_err(|e| HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())))?;
    
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "order_id": order_id,
        "status": "PENDING"
    })))
}

pub async fn get_orderbook(
    db: web::Data<Database>,
    path: web::Path<String>
) -> impl Responder {
    let pair = path.into_inner();
    
    // Query orders from DB
    let buy_orders: Vec<Order> = sqlx::query_as(
        "SELECT * FROM orders WHERE pair = ? AND side = 'BUY' AND status = 'PENDING' ORDER BY price DESC LIMIT 20"
    )
    .bind(&pair)
    .fetch_all(&db.pool)
    .await
    .unwrap_or_default();
    
    let sell_orders: Vec<Order> = sqlx::query_as(
        "SELECT * FROM orders WHERE pair = ? AND side = 'SELL' AND status = 'PENDING' ORDER BY price ASC LIMIT 20"
    )
    .bind(&pair)
    .fetch_all(&db.pool)
    .await
    .unwrap_or_default();
    
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "bids": buy_orders,
        "asks": sell_orders
    })))
}

// --- BRIDGE HANDLERS ---

pub async fn bridge_assets(
    db: web::Data<Database>,
    req: web::Json<BridgeRequest>
) -> impl Responder {
    let bridge_id = Uuid::new_v4().to_string();
    
    // Create bridge transaction
    sqlx::query(
        "INSERT INTO bridge_transactions (id, source_chain, target_chain, wallet_id, token_symbol, amount, status)
         VALUES (?, ?, ?, ?, ?, ?, 'PENDING')"
    )
    .bind(&bridge_id)
    .bind(&req.source_chain)
    .bind(&req.target_chain)
    .bind(req.wallet_id.to_string())
    .bind(&req.token_symbol)
    .bind(req.amount)
    .execute(&db.pool)
    .await
    .map_err(|e| HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())))?;
    
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "bridge_id": bridge_id,
        "status": "PENDING",
        "estimated_time": "5-10 minutes"
    })))
}

// --- EXPLORER HANDLERS ---

pub async fn get_block(
    db: web::Data<Database>,
    path: web::Path<i64>
) -> impl Responder {
    let block_number = path.into_inner();
    
    // Query block from DB
    let block: Option<crate::models::Block> = sqlx::query_as(
        "SELECT * FROM blocks WHERE block_number = ?"
    )
    .bind(block_number)
    .fetch_optional(&db.pool)
    .await
    .ok()
    .flatten();
    
    match block {
        Some(b) => HttpResponse::Ok().json(ApiResponse::success(b)),
        None => HttpResponse::NotFound().json(ApiResponse::<()>::error("Block not found".into())),
    }
}

pub async fn search_explorer(
    db: web::Data<Database>,
    query: web::Query<std::collections::HashMap<String, String>>
) -> impl Responder {
    let search_term = query.get("q").unwrap_or(&"".to_string()).clone();
    
    // Search transactions, blocks, addresses
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "results": [],
        "query": search_term
    })))
}

// --- ORACLE HANDLERS ---

pub async fn get_price(
    db: web::Data<Database>,
    path: web::Path<String>
) -> impl Responder {
    let token_symbol = path.into_inner();
    
    // Get aggregated price
    let price: Option<f64> = sqlx::query_scalar(
        "SELECT price FROM aggregated_prices WHERE token_symbol = ?"
    )
    .bind(&token_symbol)
    .fetch_optional(&db.pool)
    .await
    .ok()
    .flatten();
    
    match price {
        Some(p) => HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
            "token": token_symbol,
            "price": p,
            "sources": 3
        }))),
        None => HttpResponse::NotFound().json(ApiResponse::<()>::error("Price not found".into())),
    }
}

pub async fn update_price(
    db: web::Data<Database>,
    req: web::Json<UpdatePriceRequest>
) -> impl Responder {
    let feed_id = Uuid::new_v4().to_string();
    
    // Add price feed
    sqlx::query(
        "INSERT INTO price_feeds (id, token_symbol, price, source) VALUES (?, ?, ?, ?)"
    )
    .bind(&feed_id)
    .bind(&req.token_symbol)
    .bind(req.price)
    .bind(&req.source)
    .execute(&db.pool)
    .await
    .map_err(|e| HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())))?;
    
    // Update aggregated price (simplified - in production, calculate average)
    sqlx::query(
        "INSERT INTO aggregated_prices (token_symbol, price, sources_count, last_updated)
         VALUES (?, ?, 1, CURRENT_TIMESTAMP)
         ON CONFLICT(token_symbol) DO UPDATE SET 
            price = (price * sources_count + ?) / (sources_count + 1),
            sources_count = sources_count + 1,
            last_updated = CURRENT_TIMESTAMP"
    )
    .bind(&req.token_symbol)
    .bind(req.price)
    .bind(req.price)
    .execute(&db.pool)
    .await
    .map_err(|e| HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())))?;
    
    HttpResponse::Ok().json(ApiResponse::success("Price updated"))
}

// --- GOVERNANCE HANDLERS ---

pub async fn create_proposal(
    db: web::Data<Database>,
    req: web::Json<CreateProposalRequest>
) -> impl Responder {
    let proposal_id = format!("QIP-{}", uuid::Uuid::new_v4().to_string().chars().take(8).collect::<String>());
    let id = Uuid::new_v4().to_string();
    
    sqlx::query(
        "INSERT INTO proposals (id, proposal_id, title, description, proposer_wallet_id, status)
         VALUES (?, ?, ?, ?, ?, 'PENDING')"
    )
    .bind(&id)
    .bind(&proposal_id)
    .bind(&req.title)
    .bind(&req.description)
    .bind(req.proposer_wallet_id.to_string())
    .execute(&db.pool)
    .await
    .map_err(|e| HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())))?;
    
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "proposal_id": proposal_id,
        "status": "PENDING"
    })))
}

pub async fn vote_proposal(
    db: web::Data<Database>,
    req: web::Json<VoteRequest>
) -> impl Responder {
    // Get wallet's QVR balance for quadratic voting
    let balance = db.get_balance(req.wallet_id, "QVR").await.unwrap_or(0.0);
    let voting_power = balance.sqrt(); // Quadratic voting
    
    let vote_id = Uuid::new_v4().to_string();
    
    sqlx::query(
        "INSERT INTO votes (id, proposal_id, wallet_id, vote_type, voting_power)
         VALUES (?, ?, ?, ?, ?)"
    )
    .bind(&vote_id)
    .bind(&req.proposal_id)
    .bind(req.wallet_id.to_string())
    .bind(&req.vote_type)
    .bind(voting_power)
    .execute(&db.pool)
    .await
    .map_err(|e| HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())))?;
    
    // Update proposal vote counts
    if req.vote_type == "FOR" {
        sqlx::query(
            "UPDATE proposals SET votes_for = votes_for + 1, voting_power_for = voting_power_for + ? WHERE proposal_id = ?"
        )
        .bind(voting_power)
        .bind(&req.proposal_id)
        .execute(&db.pool)
        .await.ok();
    } else {
        sqlx::query(
            "UPDATE proposals SET votes_against = votes_against + 1, voting_power_against = voting_power_against + ? WHERE proposal_id = ?"
        )
        .bind(voting_power)
        .bind(&req.proposal_id)
        .execute(&db.pool)
        .await.ok();
    }
    
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "vote_id": vote_id,
        "voting_power": voting_power
    })))
}

pub async fn get_proposals(
    db: web::Data<Database>
) -> impl Responder {
    let proposals: Vec<crate::models::Proposal> = sqlx::query_as(
        "SELECT * FROM proposals ORDER BY created_at DESC LIMIT 50"
    )
    .fetch_all(&db.pool)
    .await
    .unwrap_or_default();
    
    HttpResponse::Ok().json(ApiResponse::success(proposals))
}

// --- YIELD FARMING HANDLERS ---

pub async fn stake_yield(
    db: web::Data<Database>,
    req: web::Json<StakeYieldRequest>
) -> impl Responder {
    let position_id = Uuid::new_v4().to_string();
    
    // Create yield position
    sqlx::query(
        "INSERT INTO yield_positions (id, pool_id, wallet_id, staked_amount)
         VALUES (?, ?, ?, ?)"
    )
    .bind(&position_id)
    .bind(&req.pool_id)
    .bind(req.wallet_id.to_string())
    .bind(req.amount)
    .execute(&db.pool)
    .await
    .map_err(|e| HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())))?;
    
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "position_id": position_id,
        "staked_amount": req.amount
    })))
}

pub async fn get_yield_pools(
    db: web::Data<Database>
) -> impl Responder {
    let pools: Vec<crate::models::YieldPool> = sqlx::query_as(
        "SELECT * FROM yield_pools WHERE is_active = TRUE"
    )
    .fetch_all(&db.pool)
    .await
    .unwrap_or_default();
    
    HttpResponse::Ok().json(ApiResponse::success(pools))
}

// --- AIRDROP HANDLERS ---

pub async fn claim_airdrop(
    db: web::Data<Database>,
    req: web::Json<ClaimAirdropRequest>
) -> impl Responder {
    // Check if already claimed
    let existing: Option<String> = sqlx::query_scalar(
        "SELECT id FROM airdrop_claims WHERE campaign_id = ? AND wallet_id = ?"
    )
    .bind(&req.campaign_id)
    .bind(req.wallet_id.to_string())
    .fetch_optional(&db.pool)
    .await
    .ok()
    .flatten();
    
    if existing.is_some() {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Already claimed".into()));
    }
    
    // Get campaign
    let campaign: Option<crate::models::AirdropCampaign> = sqlx::query_as(
        "SELECT * FROM airdrop_campaigns WHERE id = ? AND status = 'ACTIVE'"
    )
    .bind(&req.campaign_id)
    .fetch_optional(&db.pool)
    .await
    .ok()
    .flatten();
    
    match campaign {
        Some(c) => {
            let claim_id = Uuid::new_v4().to_string();
            
            sqlx::query(
                "INSERT INTO airdrop_claims (id, campaign_id, wallet_id, amount, merkle_proof)
                 VALUES (?, ?, ?, ?, ?)"
            )
            .bind(&claim_id)
            .bind(&req.campaign_id)
            .bind(req.wallet_id.to_string())
            .bind(c.per_claim)
            .bind(req.merkle_proof.as_ref())
            .execute(&db.pool)
            .await
            .map_err(|e| HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())))?;
            
            HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
                "claim_id": claim_id,
                "amount": c.per_claim
            })))
        },
        None => HttpResponse::NotFound().json(ApiResponse::<()>::error("Campaign not found".into())),
    }
}

// --- WALLET ENHANCEMENT HANDLERS ---

pub async fn create_multisig(
    db: web::Data<Database>,
    req: web::Json<CreateMultiSigRequest>
) -> impl Responder {
    let signers: Vec<String> = req.signer_wallet_ids.iter().map(|id| id.to_string()).collect();
    
    let multisig = match MultiSigManager::create_multisig(signers, req.threshold as usize) {
        Ok(m) => m,
        Err(e) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error(e.to_string())),
    };
    
    // Save multisig wallet
    sqlx::query(
        "INSERT INTO multisig_wallets (id, address, threshold, total_signers)
         VALUES (?, ?, ?, ?)"
    )
    .bind(&multisig.id)
    .bind(&multisig.address)
    .bind(multisig.threshold)
    .bind(multisig.total_signers)
    .execute(&db.pool)
    .await
    .map_err(|e| HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())))?;
    
    // Save signers
    for wallet_id in &req.signer_wallet_ids {
        // Get wallet public key
        let wallet: Option<crate::models::Wallet> = sqlx::query_as(
            "SELECT * FROM wallets WHERE id = ?"
        )
        .bind(wallet_id.to_string())
        .fetch_optional(&db.pool)
        .await
        .ok()
        .flatten();
        
        if let Some(w) = wallet {
            sqlx::query(
                "INSERT INTO multisig_signers (multisig_id, wallet_id, public_key, weight)
                 VALUES (?, ?, ?, 1)"
            )
            .bind(&multisig.id)
            .bind(wallet_id.to_string())
            .bind(w.public_key)
            .execute(&db.pool)
            .await.ok();
        }
    }
    
    HttpResponse::Ok().json(ApiResponse::success(multisig))
}

pub async fn sign_multisig(
    db: web::Data<Database>,
    req: web::Json<SignMultiSigRequest>
) -> impl Responder {
    let signature_id = Uuid::new_v4().to_string();
    
    // Add signature
    sqlx::query(
        "INSERT INTO multisig_signatures (id, multisig_tx_id, signer_wallet_id, signature)
         VALUES (?, ?, ?, ?)"
    )
    .bind(&signature_id)
    .bind(&req.multisig_tx_id)
    .bind(req.signer_wallet_id.to_string())
    .bind(&req.signature)
    .execute(&db.pool)
    .await
    .map_err(|e| HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())))?;
    
    // Update signature count
    let count: i32 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM multisig_signatures WHERE multisig_tx_id = ?"
    )
    .bind(&req.multisig_tx_id)
    .fetch_one(&db.pool)
    .await
    .unwrap_or(0);
    
    // Get required signatures
    let required: Option<i32> = sqlx::query_scalar(
        "SELECT required_signatures FROM multisig_transactions WHERE id = ?"
    )
    .bind(&req.multisig_tx_id)
    .fetch_optional(&db.pool)
    .await
    .ok()
    .flatten();
    
    if let Some(req_sig) = required {
        if MultiSigManager::verify_signatures(count, req_sig) {
            // Update transaction status
            sqlx::query(
                "UPDATE multisig_transactions SET status = 'APPROVED', signatures_count = ? WHERE id = ?"
            )
            .bind(count)
            .bind(&req.multisig_tx_id)
            .execute(&db.pool)
            .await.ok();
        } else {
            sqlx::query(
                "UPDATE multisig_transactions SET signatures_count = ? WHERE id = ?"
            )
            .bind(count)
            .bind(&req.multisig_tx_id)
            .execute(&db.pool)
            .await.ok();
        }
    }
    
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "signature_id": signature_id,
        "signatures_count": count,
        "status": if let Some(r) = required { if count >= r { "APPROVED" } else { "PENDING" } } else { "PENDING" }
    })))
}

pub async fn create_payment_request(
    db: web::Data<Database>,
    req: web::Json<CreatePaymentRequest>
) -> impl Responder {
    let payment = PaymentGateway::create_payment_request(
        req.from_wallet_id.to_string(),
        req.to_address.clone(),
        req.token_symbol.clone(),
        req.amount,
        req.memo.clone(),
    );
    
    // Validate
    if let Err(e) = PaymentGateway::validate_payment_request(&payment) {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error(e.to_string()));
    }
    
    // Save payment request
    sqlx::query(
        "INSERT INTO payment_requests (id, from_wallet_id, to_address, token_symbol, amount, memo, qr_code_data, status, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&payment.id)
    .bind(&payment.from_wallet_id)
    .bind(&payment.to_address)
    .bind(&payment.token_symbol)
    .bind(payment.amount)
    .bind(payment.memo.as_ref())
    .bind(payment.qr_code_data.as_ref())
    .bind(&payment.status)
    .bind(payment.expires_at)
    .execute(&db.pool)
    .await
    .map_err(|e| HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())))?;
    
    HttpResponse::Ok().json(ApiResponse::success(payment))
}

pub async fn scan_qr_code(
    req: web::Json<ScanQRRequest>
) -> impl Responder {
    match QRCodeGenerator::parse_payment_qr(&req.qr_data) {
        Ok((to_address, token, amount, memo)) => {
            HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
                "to_address": to_address,
                "token": token,
                "amount": amount,
                "memo": memo
            })))
        },
        Err(e) => HttpResponse::BadRequest().json(ApiResponse::<()>::error(e.to_string())),
    }
}

// --- DEVELOPER TOOLS HANDLERS ---

pub async fn compile_contract(
    db: web::Data<Database>,
    req: web::Json<CompileContractRequest>
) -> impl Responder {
    // Validate source
    if let Err(e) = ContractCompiler::validate_source(&req.source_code) {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error(e.to_string()));
    }
    
    // Compile
    let compiled = match ContractCompiler::compile_rust_contract(&req.source_code, &req.contract_name) {
        Ok(c) => c,
        Err(e) => return HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())),
    };
    
    // Save to DB
    sqlx::query(
        "INSERT INTO compiled_contracts (id, contract_name, wasm_hex, source_code, compiler_version, gas_estimate)
         VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(&compiled.id)
    .bind(&compiled.contract_name)
    .bind(&compiled.wasm_hex)
    .bind(compiled.source_code.as_ref())
    .bind(compiled.compiler_version.as_ref())
    .bind(compiled.gas_estimate)
    .execute(&db.pool)
    .await
    .map_err(|e| HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())))?;
    
    HttpResponse::Ok().json(ApiResponse::success(compiled))
}

pub async fn verify_contract(
    db: web::Data<Database>,
    req: web::Json<VerifyContractRequest>
) -> impl Responder {
    // Get compiled contract
    let contract: Option<CompiledContract> = sqlx::query_as(
        "SELECT * FROM compiled_contracts WHERE id = ?"
    )
    .bind(&req.contract_id)
    .fetch_optional(&db.pool)
    .await
    .ok()
    .flatten();
    
    match contract {
        Some(c) => {
            match FormalVerifier::verify_contract(&c, req.properties.clone()) {
                Ok(result) => HttpResponse::Ok().json(ApiResponse::success(result)),
                Err(e) => HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())),
            }
        },
        None => HttpResponse::NotFound().json(ApiResponse::<()>::error("Contract not found".into())),
    }
}

pub async fn deploy_contract(
    db: web::Data<Database>,
    req: web::Json<DeployContractRequest>
) -> impl Responder {
    // Get compiled contract
    let compiled: Option<CompiledContract> = sqlx::query_as(
        "SELECT * FROM compiled_contracts WHERE id = ?"
    )
    .bind(&req.compiled_contract_id)
    .fetch_optional(&db.pool)
    .await
    .ok()
    .flatten();
    
    match compiled {
        Some(c) => {
            let contract_id = format!("CONTRACT-{}", Uuid::new_v4().to_string().chars().take(8).collect::<String>());
            let address = format!("0x{}", hex::encode(&contract_id.as_bytes()[..20]));
            let deploy_id = Uuid::new_v4().to_string();
            
            // Save deployed contract
            sqlx::query(
                "INSERT INTO deployed_contracts (id, contract_id, compiled_contract_id, deployer_wallet_id, address)
                 VALUES (?, ?, ?, ?, ?)"
            )
            .bind(&deploy_id)
            .bind(&contract_id)
            .bind(&req.compiled_contract_id)
            .bind(req.deployer_wallet_id.to_string())
            .bind(&address)
            .execute(&db.pool)
            .await
            .map_err(|e| HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())))?;
            
            let deployed = DeployedContract {
                id: deploy_id,
                contract_id,
                compiled_contract_id: Some(req.compiled_contract_id),
                deployer_wallet_id: req.deployer_wallet_id.to_string(),
                address,
                deployment_tx_id: None,
            };
            
            HttpResponse::Ok().json(ApiResponse::success(deployed))
        },
        None => HttpResponse::NotFound().json(ApiResponse::<()>::error("Compiled contract not found".into())),
    }
}

pub async fn generate_sdk(
    db: web::Data<Database>,
    req: web::Json<GenerateSDKRequest>
) -> impl Responder {
    // Get deployed contract
    let contract: Option<DeployedContract> = sqlx::query_as(
        "SELECT * FROM deployed_contracts WHERE contract_id = ?"
    )
    .bind(&req.contract_id)
    .fetch_optional(&db.pool)
    .await
    .ok()
    .flatten();
    
    match contract {
        Some(c) => {
            let sdk_code = match req.language.as_str() {
                "js" | "javascript" => SDKGenerator::generate_js_sdk(&c),
                "rust" => SDKGenerator::generate_rust_sdk(&c),
                _ => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Unsupported language".into())),
            };
            
            HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
                "language": req.language,
                "code": sdk_code
            })))
        },
        None => HttpResponse::NotFound().json(ApiResponse::<()>::error("Contract not found".into())),
    }
}

// --- MOBILE INTEGRATION HANDLERS ---

pub async fn register_device(
    db: web::Data<Database>,
    req: web::Json<RegisterDeviceRequest>
) -> impl Responder {
    // Validate device token
    if let Err(e) = MobileDeviceManager::validate_device_token(&req.device_token, &req.platform) {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error(e.to_string()));
    }
    
    let device = MobileDeviceManager::register_device(
        req.wallet_id.to_string(),
        req.device_token.clone(),
        req.platform.clone(),
        req.app_version.clone(),
    );
    
    // Save device
    sqlx::query(
        "INSERT INTO mobile_devices (id, wallet_id, device_token, platform, app_version)
         VALUES (?, ?, ?, ?, ?)"
    )
    .bind(&device.id)
    .bind(&device.wallet_id)
    .bind(&device.device_token)
    .bind(&device.platform)
    .bind(device.app_version.as_ref())
    .execute(&db.pool)
    .await
    .map_err(|e| HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())))?;
    
    HttpResponse::Ok().json(ApiResponse::success(device))
}

pub async fn send_notification(
    db: web::Data<Database>,
    req: web::Json<SendNotificationRequest>
) -> impl Responder {
    // Get all devices for wallet
    let devices: Vec<MobileDevice> = sqlx::query_as(
        "SELECT id, wallet_id, device_token, platform, app_version FROM mobile_devices WHERE wallet_id = ?"
    )
    .bind(req.wallet_id.to_string())
    .fetch_all(&db.pool)
    .await
    .unwrap_or_default();
    
    if devices.is_empty() {
        return HttpResponse::NotFound().json(ApiResponse::<()>::error("No devices found".into()));
    }
    
    let mut notifications = Vec::new();
    
    for device in devices {
        let notification = PushNotificationService::create_notification(
            device.id.clone(),
            req.title.clone(),
            req.body.clone(),
            req.data.clone(),
        );
        
        // Save notification
        sqlx::query(
            "INSERT INTO push_notifications (id, device_id, title, body, data, status)
             VALUES (?, ?, ?, ?, ?, 'PENDING')"
        )
        .bind(&notification.id)
        .bind(&notification.device_id)
        .bind(&notification.title)
        .bind(&notification.body)
        .bind(notification.data.as_ref().map(|d| d.to_string()))
        .execute(&db.pool)
        .await.ok();
        
        notifications.push(notification);
    }
    
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "sent_count": notifications.len(),
        "notifications": notifications
    })))
}

pub async fn enable_biometric(
    db: web::Data<Database>,
    req: web::Json<EnableBiometricRequest>
) -> impl Responder {
    let biometric = BiometricAuthManager::enable_biometric(
        req.wallet_id.to_string(),
        req.biometric_type.clone(),
        req.public_key.clone(),
    );
    
    // Save biometric auth
    sqlx::query(
        "INSERT INTO biometric_auth (id, wallet_id, biometric_type, public_key, is_enabled)
         VALUES (?, ?, ?, ?, TRUE)"
    )
    .bind(&biometric.id)
    .bind(&biometric.wallet_id)
    .bind(&biometric.biometric_type)
    .bind(&biometric.public_key)
    .execute(&db.pool)
    .await
    .map_err(|e| HttpResponse::InternalServerError().json(ApiResponse::<()>::error(e.to_string())))?;
    
    HttpResponse::Ok().json(ApiResponse::success(biometric))
}

pub async fn verify_biometric(
    db: web::Data<Database>,
    req: web::Json<VerifyBiometricRequest>
) -> impl Responder {
    // Get biometric auth
    let public_key: Option<String> = sqlx::query_scalar(
        "SELECT public_key FROM biometric_auth WHERE wallet_id = ? AND is_enabled = TRUE"
    )
    .bind(req.wallet_id.to_string())
    .fetch_optional(&db.pool)
    .await
    .ok()
    .flatten();
    
    match public_key {
        Some(pk) => {
            match BiometricAuthManager::verify_biometric(&req.challenge, &req.signature, &pk) {
                Ok(verified) => {
                    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
                        "verified": verified,
                        "wallet_id": req.wallet_id
                    })))
                },
                Err(e) => HttpResponse::BadRequest().json(ApiResponse::<()>::error(e.to_string())),
            }
        },
        None => HttpResponse::NotFound().json(ApiResponse::<()>::error("Biometric auth not enabled".into())),
    }
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/health").route(web::get().to(health_check))
    )
    .service(
        web::resource("/users").route(web::post().to(create_user))
    )
    .service(
        web::resource("/wallets/{id}/balance/{token}").route(web::get().to(get_balance))
    )
    .service(
        web::resource("/wallets/{id}/stake").route(web::get().to(get_stake_info))
    )
    .service(
        web::resource("/wallets/{id}/transactions").route(web::get().to(get_transactions))
    )
    .service(
        web::resource("/transfer").route(web::post().to(transfer))
    )
    .service(
        web::resource("/stake").route(web::post().to(stake))
    )
    // Network & VM Routes
    .service(
        web::resource("/network/status").route(web::get().to(get_network_status))
    )
    .service(
        web::resource("/contracts/execute").route(web::post().to(execute_contract))
    )
    .service(
        web::resource("/compliance/iso20022").route(web::post().to(verify_iso20022))
    )
    .service(
        web::resource("/ai/analyze").route(web::post().to(analyze_tx))
    )
    // Exchange Routes
    .service(
        web::resource("/exchange/swap").route(web::post().to(swap_tokens))
    )
    .service(
        web::resource("/exchange/pools").route(web::get().to(get_liquidity_pools))
    )
    .service(
        web::resource("/exchange/orders").route(web::post().to(create_order))
    )
    .service(
        web::resource("/exchange/orderbook/{pair}").route(web::get().to(get_orderbook))
    )
    // Bridge Routes
    .service(
        web::resource("/bridge/transfer").route(web::post().to(bridge_assets))
    )
    // Explorer Routes
    .service(
        web::resource("/explorer/block/{number}").route(web::get().to(get_block))
    )
    .service(
        web::resource("/explorer/search").route(web::get().to(search_explorer))
    )
    // Oracle Routes
    .service(
        web::resource("/oracle/price/{token}").route(web::get().to(get_price))
    )
    .service(
        web::resource("/oracle/update").route(web::post().to(update_price))
    )
    // Governance Routes
    .service(
        web::resource("/governance/proposals").route(web::get().to(get_proposals))
    )
    .service(
        web::resource("/governance/proposal").route(web::post().to(create_proposal))
    )
    .service(
        web::resource("/governance/vote").route(web::post().to(vote_proposal))
    )
    // Yield Farming Routes
    .service(
        web::resource("/yield/pools").route(web::get().to(get_yield_pools))
    )
    .service(
        web::resource("/yield/stake").route(web::post().to(stake_yield))
    )
    // Airdrop Routes
    .service(
        web::resource("/airdrop/claim").route(web::post().to(claim_airdrop))
    )
    // Wallet Enhancement Routes
    .service(
        web::resource("/wallet/multisig/create").route(web::post().to(create_multisig))
    )
    .service(
        web::resource("/wallet/multisig/sign").route(web::post().to(sign_multisig))
    )
    .service(
        web::resource("/wallet/payment/create").route(web::post().to(create_payment_request))
    )
    .service(
        web::resource("/wallet/qr/scan").route(web::post().to(scan_qr_code))
    )
    // Developer Tools Routes
    .service(
        web::resource("/dev/compile").route(web::post().to(compile_contract))
    )
    .service(
        web::resource("/dev/verify").route(web::post().to(verify_contract))
    )
    .service(
        web::resource("/dev/deploy").route(web::post().to(deploy_contract))
    )
    .service(
        web::resource("/dev/sdk").route(web::post().to(generate_sdk))
    )
    // Mobile Integration Routes
    .service(
        web::resource("/mobile/device/register").route(web::post().to(register_device))
    )
    .service(
        web::resource("/mobile/notification/send").route(web::post().to(send_notification))
    )
    .service(
        web::resource("/mobile/biometric/enable").route(web::post().to(enable_biometric))
    )
    .service(
        web::resource("/mobile/biometric/verify").route(web::post().to(verify_biometric))
    );
}
