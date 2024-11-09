use std::sync::LazyLock;

use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use futures::TryStreamExt;
use mongodb::{
    bson::{doc, Uuid},
    Database,
};

use crate::models::ChangingRoom;

static GENERIC_DB_ERROR: LazyLock<(StatusCode, String)> = LazyLock::new(|| {
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        String::from("An unexpected error occured getting data from database"),
    )
});

pub async fn get_all_rooms(
    State(db): State<Database>,
) -> Result<Json<Vec<ChangingRoom>>, (StatusCode, String)> {
    let collection = db.collection::<ChangingRoom>("rooms");

    let rooms = collection
        .find(doc! {})
        .await
        .map_err(|e| {
            tracing::error!(err = e.to_string(), "Unable to get cursor for all rooms");
            GENERIC_DB_ERROR.clone()
        })?
        .try_collect()
        .await
        .map_err(|e| {
            tracing::error!(err = e.to_string(), "Unable to collect rooms into Vec");
            GENERIC_DB_ERROR.clone()
        })?;

    Ok(Json(rooms))
}

pub async fn get_room_by_id(
    Path(id): Path<String>,
    State(db): State<Database>,
) -> Result<Json<ChangingRoom>, (StatusCode, String)> {
    let id = Uuid::parse_str(&id).map_err(|e| {
        tracing::error!(err = e.to_string(), "Unable to parse uuid from string");
        (
            StatusCode::BAD_REQUEST,
            format!("Id {id} is not correctly formatted. Must be a valid uuid."),
        )
    })?;

    let collection = db.collection::<ChangingRoom>("rooms");
    let result = collection.find_one(doc! { "id": id }).await.map_err(|e| {
        tracing::error!(err = e.to_string(), "Unable to get room by id from db");
        GENERIC_DB_ERROR.clone()
    })?;

    match result {
        Some(room) => Ok(Json(room)),
        None => Err((
            StatusCode::NOT_FOUND,
            format!("No room found with id {:?}", id),
        )),
    }
}
