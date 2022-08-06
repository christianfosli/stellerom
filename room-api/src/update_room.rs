use axum::{extract::Path, http::StatusCode, Extension, Json};
use mongodb::{
    bson::{doc, Uuid},
    options::{FindOneAndReplaceOptions, ReturnDocument},
    Database,
};
use serde::Deserialize;

use crate::models::{ChangingRoom, Location, Ratings};

#[derive(Clone, Debug, Deserialize)]
pub struct UpdateChangingRoom {
    pub name: String,
    pub location: Location,
    pub ratings: Option<Ratings>,
}

pub async fn update_room(
    Path(id): Path<String>,
    Json(payload): Json<UpdateChangingRoom>,
    Extension(db): Extension<Database>,
) -> Result<Json<ChangingRoom>, (StatusCode, String)> {
    let id = Uuid::parse_str(&id).map_err(|e| {
        tracing::error!(err = e.to_string(), "Unable to parse uuid from string");
        (
            StatusCode::BAD_REQUEST,
            format!("Id {id} is incorrectly formatted. Must be a valid uuid."),
        )
    })?;

    let collection = db.collection::<ChangingRoom>("rooms");

    let updated_room = collection
        .find_one_and_replace(
            doc! { "id": id },
            ChangingRoom {
                id,
                name: payload.name,
                location: payload.location,
                ratings: payload.ratings,
            },
            FindOneAndReplaceOptions::builder()
                .return_document(Some(ReturnDocument::After))
                .build(),
        )
        .await
        .map_err(|e| {
            tracing::error!(err = e.to_string(), "Unable to find and replace room");
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "An unexpected error occured updating changing room".to_owned(),
            )
        })?;

    match updated_room {
        Some(room) => Ok(Json(room)),
        None => Err((StatusCode::NOT_FOUND, format!("No room found with id {id}"))),
    }
}
