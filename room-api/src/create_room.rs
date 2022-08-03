use axum::{http::StatusCode, Extension, Json};
use mongodb::{bson::Uuid, Database};
use serde::Deserialize;

use crate::models::{ChangingRoom, Location};

#[derive(Clone, Debug, Deserialize)]
pub struct CreateChangingRoom {
    pub name: String,
    pub location: Location,
}

pub async fn create_room(
    Json(payload): Json<CreateChangingRoom>,
    Extension(db): Extension<Database>,
) -> Result<(StatusCode, Json<ChangingRoom>), (StatusCode, String)> {
    let collection = db.collection::<ChangingRoom>("rooms");

    let created = ChangingRoom {
        id: Uuid::new(),
        name: payload.name,
        location: payload.location,
        ratings: None,
    };

    collection.insert_one(&created, None).await.map_err(|e| {
        tracing::error!(err = e.to_string(), "Error persisting room to db");
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "An unexpected error occured trying to persist room to database".to_owned(),
        )
    })?;

    Ok((StatusCode::CREATED, Json(created)))
}
