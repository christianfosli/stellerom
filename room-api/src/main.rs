use std::net::SocketAddr;

use axum::Server;
use axum::{routing::get, Router};

use crate::get_rooms::get_rooms;
use crate::healthcheck::{live, ready};

mod get_rooms;
mod healthcheck;
mod simple_types;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/readyz", get(ready))
        .route("/livez", get(live))
        .route("/rooms", get(get_rooms));

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::info!("Service started. Listening on {}", addr);

    Server::bind(&addr).serve(app.into_make_service()).await?;

    Ok(())
}
