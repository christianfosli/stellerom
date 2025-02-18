use axum::{
    extract::{Query, State},
    http::StatusCode,
    Json,
};
use futures::TryStreamExt;
use mongodb::{
    bson::{doc, Uuid},
    Database,
};
use serde::Deserialize;

use crate::models::Review;

#[derive(Debug, Clone, Deserialize)]
pub struct Params {
    #[serde(rename = "roomId")]
    room_id: Option<String>,
}

pub async fn get_reviews(
    Query(param): Query<Params>,
    State(db): State<Database>,
) -> Result<Json<Vec<Review>>, (StatusCode, String)> {
    let collection = db.collection::<Review>("reviews");

    let filter = match param.room_id {
        Some(room_id) => {
            let room_id = Uuid::parse_str(room_id).map_err(|e| {
                tracing::error!(err = e.to_string(), "Unable to parse room-id as uuid");
                (
                    StatusCode::UNPROCESSABLE_ENTITY,
                    format!(
                        "Room-id must be a valid uuid but is not. Inner error: {}",
                        e
                    ),
                )
            })?;
            doc! { "roomId": room_id}
        }
        None => doc! {},
    };

    let reviews = collection
        .find(filter)
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
