use bounded_integer::BoundedU8;
use mongodb::bson::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ChangingRoom {
    pub id: Uuid,
    pub name: String,
    pub location: Location,
    pub ratings: Option<Ratings>,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct Location {
    pub lat: f64,
    pub lng: f64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Ratings {
    availability: StarRating,
    safety: StarRating,
    cleanliness: StarRating,
}

type StarRating = BoundedU8<1, 5>;
