use std::env;
use std::net::SocketAddr;

use axum::Server;
use axum::{routing, Extension, Router};
use mongodb::options::ClientOptions;
use mongodb::{Client, Database};

use crate::create_room::create_room;
use crate::delete_room::delete_room;
use crate::get_rooms::{get_all_rooms, get_room_by_id};
use crate::healthcheck::{live, ready};
use crate::update_room::update_room;

mod create_room;
mod delete_room;
mod get_rooms;
mod healthcheck;
mod models;
mod simple_types;
mod update_room;

#[macro_use]
extern crate lazy_static;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    let db = get_db_handle().await?;

    let app = Router::new()
        .route("/readyz", routing::get(ready))
        .route("/livez", routing::get(live))
        .route("/rooms", routing::post(create_room))
        .route("/rooms", routing::get(get_all_rooms))
        .route("/rooms/:id", routing::get(get_room_by_id))
        .route("/rooms/:id", routing::put(update_room))
        .route("/rooms/:id", routing::delete(delete_room))
        .layer(Extension(db));

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::info!("Service started. Listening on {}", addr);

    Server::bind(&addr).serve(app.into_make_service()).await?;

    Ok(())
}

async fn get_db_handle() -> Result<Database, mongodb::error::Error> {
    let connstr = match env::var("ROOM_API_DB_CONNSTR") {
        Ok(connstr) => connstr,
        Err(e) => {
            tracing::warn!(
                err = e.to_string(),
                "Could not get ROOM_API_DB_CONNSTR from env var. Defaulting to localhost db"
            );
            "mongodb://root:secret@localhost:27017/".to_owned()
        }
    };

    let mongo_client = Client::with_options(ClientOptions::parse(connstr).await?)?;

    let db_name = match env::var("ROOM_API_DB_NAME") {
        Ok(name) => name,
        Err(e) => {
            tracing::info!(
                err = e.to_string(),
                "ROOM_API_DB_NAME not set. Using default name room-api"
            );
            "room-api".to_owned()
        }
    };

    Ok(mongo_client.database(&db_name))
}
