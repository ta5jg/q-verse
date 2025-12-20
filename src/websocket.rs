use actix_web::{web, HttpRequest, HttpResponse, Error};
use actix_web_actors::ws;
use actix::prelude::*;
use serde::{Deserialize, Serialize};
use std::time::{Duration, Instant};
use log;

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);
const CLIENT_TIMEOUT: Duration = Duration::from_secs(30);

#[derive(Serialize, Deserialize)]
struct WsMessage {
    action: String,
    event: Option<String>,
    data: Option<serde_json::Value>,
}

/// WebSocket connection handler
pub struct QVerseWebSocket {
    hb: Instant,
    subscribed_events: Vec<String>,
}

impl Actor for QVerseWebSocket {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        self.hb = Instant::now();
        self.hb(ctx);
        log::info!("WebSocket connection established");
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        log::info!("WebSocket connection closed");
        Running::Stop
    }
}

impl QVerseWebSocket {
    pub fn new() -> Self {
        Self {
            hb: Instant::now(),
            subscribed_events: Vec::new(),
        }
    }

    fn hb(&self, ctx: &mut ws::WebsocketContext<Self>) {
        ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {
            if Instant::now().duration_since(act.hb) > CLIENT_TIMEOUT {
                log::warn!("WebSocket client timeout, disconnecting");
                ctx.stop();
                return;
            }
            ctx.ping(b"");
        });
    }

    fn handle_message(&mut self, msg: String, ctx: &mut ws::WebsocketContext<Self>) {
        match serde_json::from_str::<WsMessage>(&msg) {
            Ok(ws_msg) => {
                match ws_msg.action.as_str() {
                    "subscribe" => {
                        if let Some(event) = ws_msg.event {
                            if !self.subscribed_events.contains(&event) {
                                self.subscribed_events.push(event.clone());
                                log::info!("Subscribed to event: {}", event);
                            }
                        }
                    },
                    "unsubscribe" => {
                        if let Some(event) = ws_msg.event {
                            self.subscribed_events.retain(|e| e != &event);
                            log::info!("Unsubscribed from event: {}", event);
                        }
                    },
                    _ => {
                        log::warn!("Unknown WebSocket action: {}", ws_msg.action);
                    },
                }
            },
            Err(e) => {
                log::error!("Failed to parse WebSocket message: {}", e);
            },
        }
    }

    fn broadcast_event(&self, event: &str, data: serde_json::Value, ctx: &mut ws::WebsocketContext<Self>) {
        if self.subscribed_events.contains(&event.to_string()) {
            let msg = serde_json::json!({
                "type": event,
                "data": data
            });
            ctx.text(serde_json::to_string(&msg).unwrap_or_default());
        }
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for QVerseWebSocket {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut ws::WebsocketContext<Self>) {
        match msg {
            Ok(ws::Message::Ping(msg)) => {
                self.hb = Instant::now();
                ctx.pong(&msg);
            }
            Ok(ws::Message::Pong(_)) => {
                self.hb = Instant::now();
            }
            Ok(ws::Message::Text(text)) => {
                self.handle_message(text.to_string(), ctx);
            }
            Ok(ws::Message::Binary(_)) => {
                log::warn!("Binary WebSocket messages not supported");
            }
            Ok(ws::Message::Close(reason)) => {
                ctx.close(reason);
                ctx.stop();
            }
            Err(e) => {
                log::error!("WebSocket error: {}", e);
                ctx.stop();
            }
            _ => ctx.stop(),
        }
    }
}

pub async fn websocket_handler(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    let resp = ws::start(QVerseWebSocket::new(), &req, stream)?;
    Ok(resp)
}
