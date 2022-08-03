use bounded_integer::BoundedU8;
use chrono::prelude::*;
use mongodb::bson::Uuid;
use serde::{Deserialize, Serialize};

pub type StarRating = BoundedU8<1, 5>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Review {
    #[serde(rename = "roomId")]
    pub room_id: Uuid,
    #[serde(rename = "reviewedAt")]
    pub reviewed_at: DateTime<Utc>,
    #[serde(rename = "availabilityRating")]
    pub availability_rating: StarRating,
    #[serde(rename = "safetyRating")]
    pub safety_rating: StarRating,
    #[serde(rename = "cleanlinessRating")]
    pub cleanliness_rating: StarRating,
    pub review: Option<String>,
}
