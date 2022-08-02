use axum::{extract::Query, http::StatusCode, Extension, Json};
use futures::TryStreamExt;
use mongodb::{
    bson::{doc, Uuid},
    Database,
};
use serde::Deserialize;

use crate::models::Review;

#[derive(Debug, Clone, Deserialize)]
pub struct Params {
    #[serde(rename = "room-id")]
    room_id: Option<String>,
}

pub async fn get_reviews(
    Query(param): Query<Params>,
    Extension(db): Extension<Database>,
) -> Result<Json<Vec<Review>>, (StatusCode, String)> {
    let collection = db.collection::<Review>("reviews");

    let filter = param
        .room_id
        .map(Uuid::parse_str)
        .transpose()
        .map_err(|e| {
            tracing::error!(err = e.to_string(), "Unable to parse room-id as uuid");
            (
                StatusCode::UNPROCESSABLE_ENTITY,
                format!(
                    "Room-id must be a valid uuid but is not. Inner error: {}",
                    e.to_string()
                ),
            )
        })?
        .map(|room_id| doc! { "roomId": room_id });

    let reviews = collection
        .find(filter, None)
        .await
        .map_err(|e| {
            tracing::error!(err = e.to_string(), "Unable to get cursor for reviews");
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "An unexpected error occured getting reviews from database".to_owned(),
            )
        })?
        .try_collect()
        .await
        .map_err(|e| {
            tracing::error!(err = e.to_string(), "Unable to collect reviews into Vec");
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "An unexpected error occured getting reviews from database".to_owned(),
            )
        })?;

    Ok(Json(reviews))
}
