use axum::{http::StatusCode, response::IntoResponse, Json};
use serde::Serialize;
use uuid::Uuid;

use crate::simple_types::Location;

#[derive(Clone, Debug, Serialize)]
pub struct ChangingRoom {
    pub id: Uuid,
    pub name: String,
    pub location: Location,
}

pub async fn get_rooms() -> impl IntoResponse {
    let mock_rooms = vec![
        ChangingRoom {
            id: Uuid::new_v4(),
            name: "Mock room 1".to_owned(),
            location: Location {
                lat: 60.0,
                lng: 10.0,
            },
        },
        ChangingRoom {
            id: Uuid::new_v4(),
            name: "Mock room 2".to_owned(),
            location: Location {
                lat: 63.0,
                lng: 11.5,
            },
        },
    ];
    (StatusCode::OK, Json(mock_rooms))
}
