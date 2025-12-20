use crate::models::{LiquidityPool, Order, Trade, OrderSide, OrderType};
use std::error::Error;

/// Automated Market Maker (AMM) - Uniswap V2 style constant product formula
pub struct AMM;

impl AMM {
    /// Calculate output amount for a swap (x * y = k)
    /// reserve_in: Reserve of input token
    /// reserve_out: Reserve of output token
    /// amount_in: Amount of input token
    /// fee_rate: Trading fee (e.g., 0.003 for 0.3%)
    pub fn calculate_swap_out(
        reserve_in: f64,
        reserve_out: f64,
        amount_in: f64,
        fee_rate: f64,
    ) -> Result<f64, Box<dyn Error>> {
        if reserve_in <= 0.0 || reserve_out <= 0.0 || amount_in <= 0.0 {
            return Err("Invalid reserves or amount".into());
        }

        let amount_in_with_fee = amount_in * (1.0 - fee_rate);
        let numerator = amount_in_with_fee * reserve_out;
        let denominator = reserve_in + amount_in_with_fee;
        
        Ok(numerator / denominator)
    }

    /// Calculate required input amount for desired output
    pub fn calculate_swap_in(
        reserve_in: f64,
        reserve_out: f64,
        amount_out: f64,
        fee_rate: f64,
    ) -> Result<f64, Box<dyn Error>> {
        if reserve_in <= 0.0 || reserve_out <= 0.0 || amount_out <= 0.0 {
            return Err("Invalid reserves or amount".into());
        }

        if amount_out >= reserve_out {
            return Err("Insufficient liquidity".into());
        }

        let numerator = reserve_in * amount_out;
        let denominator = (reserve_out - amount_out) * (1.0 - fee_rate);
        
        Ok(numerator / denominator)
    }

    /// Add liquidity to pool
    pub fn add_liquidity(
        reserve_a: f64,
        reserve_b: f64,
        amount_a: f64,
        amount_b: f64,
    ) -> Result<f64, Box<dyn Error>> {
        if reserve_a == 0.0 && reserve_b == 0.0 {
            // New pool: use geometric mean
            Ok((amount_a * amount_b).sqrt())
        } else if reserve_a == 0.0 || reserve_b == 0.0 {
            return Err("Invalid pool state".into());
        } else {
            // Existing pool: maintain ratio
            let ratio = reserve_a / reserve_b;
            let expected_b = amount_a / ratio;
            
            if (expected_b - amount_b).abs() / expected_b > 0.01 {
                return Err("Liquidity ratio mismatch".into());
            }
            
            let liquidity = (amount_a * reserve_b + amount_b * reserve_a) / (2.0 * reserve_b);
            Ok(liquidity)
        }
    }

    /// Remove liquidity from pool
    pub fn remove_liquidity(
        reserve_a: f64,
        reserve_b: f64,
        liquidity: f64,
        total_supply: f64,
    ) -> Result<(f64, f64), Box<dyn Error>> {
        if total_supply <= 0.0 || liquidity <= 0.0 {
            return Err("Invalid liquidity or supply".into());
        }

        let ratio = liquidity / total_supply;
        let amount_a = reserve_a * ratio;
        let amount_b = reserve_b * ratio;
        
        Ok((amount_a, amount_b))
    }
}

/// Order Matching Engine
pub struct OrderMatcher;

impl OrderMatcher {
    /// Match limit orders (simple price-time priority)
    pub fn match_orders(
        buy_orders: &mut Vec<Order>,
        sell_orders: &mut Vec<Order>,
    ) -> Vec<Trade> {
        let mut trades = Vec::new();
        
        buy_orders.sort_by(|a, b| {
            b.price.partial_cmp(&a.price)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        
        sell_orders.sort_by(|a, b| {
            a.price.partial_cmp(&b.price)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        let mut buy_idx = 0;
        let mut sell_idx = 0;

        while buy_idx < buy_orders.len() && sell_idx < sell_orders.len() {
            let buy_order = &buy_orders[buy_idx];
            let sell_order = &sell_orders[sell_idx];

            if buy_order.price >= sell_order.price {
                let trade_amount = (buy_order.amount - buy_order.filled)
                    .min(sell_order.amount - sell_order.filled);
                let trade_price = sell_order.price; // Price-time priority: taker pays maker's price

                if trade_amount > 0.0 {
                    let trade = Trade {
                        id: uuid::Uuid::new_v4().to_string(),
                        order_id: buy_order.id.clone(),
                        pair: buy_order.pair.clone(),
                        price: trade_price,
                        amount: trade_amount,
                        side: "BUY".to_string(),
                        maker_wallet_id: sell_order.wallet_id.clone(),
                        taker_wallet_id: buy_order.wallet_id.clone(),
                        fee: trade_amount * trade_price * 0.001, // 0.1% fee
                    };

                    trades.push(trade);
                    
                    // Update filled amounts
                    let buy_order = &mut buy_orders[buy_idx];
                    buy_order.filled += trade_amount;
                    if buy_order.filled >= buy_order.amount {
                        buy_order.status = "FILLED".to_string();
                        buy_idx += 1;
                    }

                    let sell_order = &mut sell_orders[sell_idx];
                    sell_order.filled += trade_amount;
                    if sell_order.filled >= sell_order.amount {
                        sell_order.status = "FILLED".to_string();
                        sell_idx += 1;
                    }
                } else {
                    break;
                }
            } else {
                break; // No more matches possible
            }
        }

        trades
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_amm_swap() {
        let reserve_a = 1000.0;
        let reserve_b = 2000.0;
        let amount_in = 100.0;
        let fee_rate = 0.003;

        let amount_out = AMM::calculate_swap_out(reserve_a, reserve_b, amount_in, fee_rate).unwrap();
        assert!(amount_out > 0.0);
        assert!(amount_out < reserve_b);
    }

    #[test]
    fn test_add_liquidity() {
        let liquidity = AMM::add_liquidity(0.0, 0.0, 1000.0, 2000.0).unwrap();
        assert!(liquidity > 0.0);
    }
}
