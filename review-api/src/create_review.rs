use axum::{http::StatusCode, Extension, Json};
use chrono::Utc;
use mongodb::{bson::Uuid, Database};
use serde::Deserialize;

use crate::models::{Review, StarRating};

#[derive(Clone, Debug, Deserialize)]
pub struct CreateReview {
    #[serde(rename = "roomId")]
    pub room_id: Uuid,
    #[serde(rename = "availabilityRating")]
    pub availability_rating: StarRating,
    #[serde(rename = "safetyRating")]
    pub safety_rating: StarRating,
    #[serde(rename = "cleanlinessRating")]
    pub cleanliness_rating: StarRating,
    pub review: Option<String>,
}

pub async fn create_review(
    Json(payload): Json<CreateReview>,
    Extension(db): Extension<Database>,
) -> Result<(StatusCode, Json<Review>), (StatusCode, String)> {
    let collection = db.collection::<Review>("reviews");

    let review = Review {
        room_id: payload.room_id,
        reviewed_at: Utc::now(),
        availability_rating: payload.availability_rating,
        safety_rating: payload.safety_rating,
        cleanliness_rating: payload.cleanliness_rating,
        review: payload.review,
    };

    collection.insert_one(&review, None).await.map_err(|e| {
        tracing::error!(err = e.to_string(), "Error persisting review to db");
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "An unexpected error occured trying to persist review to database".to_owned(),
        )
    })?;

    Ok((StatusCode::CREATED, Json(review)))
}
