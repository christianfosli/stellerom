use axum::{extract::State, http::StatusCode, Json};
use geojson::{Geometry, Value};
use mongodb::{bson::Uuid, Database};
use serde::Deserialize;

use crate::models::{ChangingRoom, Location};

#[derive(Clone, Debug, Deserialize)]
pub struct CreateChangingRoom {
    pub name: String,
    pub location: Location,
}

pub async fn create_room(
    State(db): State<Database>,
    Json(payload): Json<CreateChangingRoom>,
) -> Result<(StatusCode, Json<ChangingRoom>), (StatusCode, String)> {
    let collection = db.collection::<ChangingRoom>("rooms");

    let created = ChangingRoom {
        id: Uuid::new(),
        external_id: None,
        name: payload.name,
        location: payload.location,
        location_geo: Geometry::new(Value::Point(vec![
            payload.location.lng,
            payload.location.lat,
        ])),
        ratings: None,
    };

    collection.insert_one(&created).await.map_err(|e| {
        tracing::error!(err = e.to_string(), "Error persisting room to db");
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "An unexpected error occured trying to persist room to database".to_owned(),
        )
    })?;

    Ok((StatusCode::CREATED, Json(created)))
}
