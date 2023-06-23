use axum::{
    extract::{Path, State},
    http::StatusCode,
};
use mongodb::{
    bson::{doc, Uuid},
    Database,
};

use crate::models::ChangingRoom;

pub async fn delete_room(
    Path(id): Path<String>,
    State(db): State<Database>,
) -> Result<(), (StatusCode, String)> {
    let id = Uuid::parse_str(&id).map_err(|e| {
        tracing::error!(err = e.to_string(), "Unable to parse uuid from string");
        (
            StatusCode::BAD_REQUEST,
            format!("Id {id} is incorrectly formatted. Must be a valid uuid."),
        )
    })?;

    let collection = db.collection::<ChangingRoom>("rooms");

    collection
        .delete_one(doc! { "id": id }, None)
        .await
        .map_err(|e| {
            tracing::error!(err = e.to_string(), "Error deleting changing room");
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "An unexpected error occured trying to delete room from database".to_owned(),
            )
        })?;

    Ok(())
}
