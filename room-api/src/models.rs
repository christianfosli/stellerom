use bounded_integer::BoundedU8;
use geojson::Geometry;
use mongodb::bson::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ChangingRoom {
    pub id: Uuid,
    pub name: String,
    pub location: Location,
    #[serde(rename = "locationGeo")]
    pub location_geo: Option<Geometry>,
    pub ratings: Option<Ratings>,
    #[serde(rename = "externalId")]
    pub external_id: Option<String>,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct Location {
    pub lat: f64,
    pub lng: f64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Ratings {
    pub availability: StarRating,
    pub safety: StarRating,
    pub cleanliness: StarRating,
}

pub type StarRating = BoundedU8<1, 5>;
