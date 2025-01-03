use std::env;
use std::net::SocketAddr;

use axum::http::{self, Method};
use axum::{routing, Router};
use mongodb::options::ClientOptions;
use mongodb::{Client, Database};
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

use crate::create_review::create_review;
use crate::get_reviews::get_reviews;
use crate::healthcheck::{live, ready};

mod create_review;
mod get_reviews;
mod healthcheck;
mod models;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    let db = get_db_handle().await?;

    let app = Router::new()
        .route("/readyz", routing::get(ready))
        .route("/livez", routing::get(live))
        .route("/reviews", routing::get(get_reviews))
        .route("/reviews", routing::post(create_review))
        .layer(
            CorsLayer::new()
                .allow_origin([
                    // adding frontend app for all environments for simplicity
                    "http://localhost:8501".parse()?,
                    "https://dev.stellerom.no".parse()?,
                    "https://www.stellerom.no".parse()?,
                ])
                .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
                .allow_headers([http::header::CONTENT_TYPE]),
        )
        .with_state(db);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3001));
    let listener = TcpListener::bind(addr).await?;
    tracing::info!("Service started. Listening on {addr}");

    axum::serve(listener, app).await?;

    Ok(())
}

async fn get_db_handle() -> Result<Database, mongodb::error::Error> {
    let connstr = match env::var("REVIEW_API_DB_CONNSTR") {
        Ok(connstr) => connstr,
        Err(e) => {
            tracing::warn!(
                err = e.to_string(),
                "Could not get REVIEW_API_DB_CONNSTR from env var. Defaulting to localhost db"
            );
            "mongodb://root:secret@localhost:27017/".to_owned()
        }
    };

    let mongo_client = Client::with_options(ClientOptions::parse(connstr).await?)?;

    let db_name = match env::var("REVIEW_API_DB_NAME") {
        Ok(name) => name,
        Err(e) => {
            tracing::info!(
                err = e.to_string(),
                "REVIEW_API_DB_NAME not set. Using default name review-api"
            );
            "review-api".to_owned()
        }
    };

    Ok(mongo_client.database(&db_name))
}
