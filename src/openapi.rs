use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::models::{
    ApiResponse, User, Wallet, Transaction, LiquidityPool, Order, Proposal, YieldPool,
};

#[derive(OpenApi)]
#[openapi(
    paths(
        crate::api::health_check,
        crate::api::get_metrics,
        // Temporarily comment out handlers without utoipa::path attributes
        // crate::api::create_user,
        // crate::api::get_balance,
        // crate::api::transfer,
        // crate::api::swap_tokens,
        // crate::api::get_liquidity_pools,
        // crate::api::create_order,
        // crate::api::get_orderbook,
        // crate::api::bridge_assets,
        // crate::api::get_price,
        // crate::api::get_proposals,
        // crate::api::create_proposal,
        // crate::api::vote_proposal,
        // crate::api::get_yield_pools,
        // crate::api::batch_transfer,
        // crate::api::batch_swap,
    ),
    components(schemas(
        ApiResponse<User>,
        ApiResponse<Wallet>,
        ApiResponse<Transaction>,
        ApiResponse<LiquidityPool>,
        ApiResponse<Order>,
        ApiResponse<Proposal>,
        ApiResponse<YieldPool>,
        User,
        Wallet,
        Transaction,
        LiquidityPool,
        Order,
        Proposal,
        YieldPool,
    )),
    tags(
        (name = "Health", description = "Health check endpoints"),
        (name = "Users", description = "User management endpoints"),
        (name = "Wallets", description = "Wallet operations"),
        (name = "Exchange", description = "DEX/CEX operations"),
        (name = "Bridge", description = "Cross-chain bridge"),
        (name = "Oracle", description = "Price feeds"),
        (name = "Governance", description = "DAO governance"),
        (name = "Yield", description = "Yield farming"),
        (name = "Batch", description = "Batch operations"),
        (name = "Metrics", description = "System metrics"),
    ),
    info(
        title = "Q-Verse API",
        description = "Quantum-Safe Hybrid Finance Network API Documentation",
        version = "0.2.2",
        contact(
            name = "Q-Verse Support",
            email = "support@q-verse.org",
            url = "https://q-verse.org"
        ),
        license(
            name = "MIT",
            url = "https://opensource.org/licenses/MIT"
        )
    ),
    servers(
        (url = "https://q-verse.org/api", description = "Production"),
        (url = "http://localhost:8080", description = "Local Development")
    )
)]
struct ApiDoc;

pub fn swagger_ui() -> SwaggerUi {
    SwaggerUi::new("/swagger-ui/{_:*}").url("/api-docs/openapi.json", ApiDoc::openapi())
}
