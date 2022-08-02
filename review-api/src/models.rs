use chrono::prelude::*;
use mongodb::bson::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum StarRating {
    One,
    Two,
    Three,
    Four,
    Five,
}

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
