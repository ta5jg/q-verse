// Add this to api.rs to expose AI endpoint
use crate::ai::TransactionAnalysis; // Ensure this import exists if used

// ... existing imports ...

// New Handler for AI Analysis
pub async fn analyze_tx(
    data: web::Data<AppState>,
    req: web::Json<serde_json::Value> // Accepts { amount: 1000, sender: "wallet_id" }
) -> impl Responder {
    let amount = req["amount"].as_f64().unwrap_or(0.0);
    let sender = req["sender"].as_str().unwrap_or("unknown");
    
    let mut ai = data.ai.lock().unwrap();
    let analysis = ai.analyze_transaction(amount, sender);
    
    HttpResponse::Ok().json(ApiResponse::success(analysis))
}

// In config function, add:
// .service(web::resource("/ai/analyze").route(web::post().to(analyze_tx)))
