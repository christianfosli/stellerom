use axum::{extract::State, http::StatusCode, Json};
use chrono::Utc;
use futures::TryStreamExt;
use mongodb::{
    bson::{doc, Uuid},
    Collection, Database,
};
use reqwest::Client;
use serde::Deserialize;
use serde_json::json;
use std::{env, sync::LazyLock};

use crate::models::{Review, StarRating};

static ALLOWED_IMAGE_BASE_URLS: LazyLock<Vec<String>> = LazyLock::new(|| {
    serde_json::from_str(&env::var("ALLOWED_IMAGE_BASE_URLS").unwrap_or("[]".to_owned())).unwrap()
});

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
    #[serde(rename = "imageUrl")]
    pub image_url: Option<String>,
    #[serde(rename = "reviewedBy")]
    pub reviewed_by: Option<String>,
}

pub async fn create_review(
    State(db): State<Database>,
    Json(payload): Json<CreateReview>,
) -> Result<(StatusCode, Json<Review>), (StatusCode, String)> {
    validate_payload(&payload)?;

    let collection = db.collection::<Review>("reviews");

    let review = Review {
        room_id: payload.room_id,
        availability_rating: payload.availability_rating,
        safety_rating: payload.safety_rating,
        cleanliness_rating: payload.cleanliness_rating,
        review: payload.review,
        image_url: payload.image_url,
        reviewed_by: payload.reviewed_by,
        reviewed_at: Utc::now(),
    };

    collection.insert_one(&review).await.map_err(|e| {
        tracing::error!(err = e.to_string(), "Error persisting review to db");
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "An unexpected error occured trying to persist review to database".to_owned(),
        )
    })?;

    update_room_ratings(&collection, &payload.room_id)
        .await
        .map_err(|e| {
            tracing::error!(
                err = e.to_string(),
                "Error updating ratings in room service"
            );
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "An unexpected error occured trying to update ratings for room".to_owned(),
            )
        })?;

    Ok((StatusCode::CREATED, Json(review)))
}

fn validate_payload(payload: &CreateReview) -> Result<(), (StatusCode, String)> {
    if payload.image_url.is_some()
        && ALLOWED_IMAGE_BASE_URLS
            .iter()
            .any(|allowed| !payload.image_url.clone().unwrap().starts_with(allowed))
    {
        tracing::error!(
            url = payload.image_url,
            "Validation error: Illegal image URL"
        );
        Err((
            StatusCode::UNPROCESSABLE_ENTITY,
            format!(
                "Invalid image url. URL's must start with {:?}",
                ALLOWED_IMAGE_BASE_URLS.join(",")
            ),
        ))
    } else {
        Ok(())
    }
}

async fn update_room_ratings(
    collection: &Collection<Review>,
    room_id: &Uuid,
) -> Result<(), Box<dyn std::error::Error>> {
    let reviews = collection
        .find(doc! { "roomId": *room_id })
        .await?
        .try_collect::<Vec<_>>()
        .await?;

    let availability = (reviews
        .iter()
        .map(|r| u32::from(r.availability_rating))
        .sum::<u32>() as f64
        / reviews.len() as f64)
        .round() as u8;

    let safety = (reviews
        .iter()
        .map(|r| u32::from(r.safety_rating))
        .sum::<u32>() as f64
        / reviews.len() as f64)
        .round() as u8;

    let cleanliness = (reviews
        .iter()
        .map(|r| u32::from(r.cleanliness_rating))
        .sum::<u32>() as f64
        / reviews.len() as f64)
        .round() as u8;

    let url = format!(
        "{base_url}/rooms/{room_id}",
        base_url = env::var("ROOM_API_URL")?
    );

    let client = Client::new();

    let mut get_room_res = client
        .get(&url)
        .send()
        .await?
        .error_for_status()?
        .json::<serde_json::Value>()
        .await?;

    let room = get_room_res.as_object_mut().unwrap(); // TODO: ok_or Error and `?` instead

    _ = room.insert(
        "ratings".to_owned(),
        json!({ "availability": availability , "safety": safety, "cleanliness": cleanliness}),
    );

    _ = client
        .put(&url)
        .json(&room)
        .send()
        .await?
        .error_for_status()?;

    Ok(())
}
