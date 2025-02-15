use std::sync::LazyLock;

use axum::{
    extract::{Path, State},
    http::{header, StatusCode},
    response::IntoResponse,
    Json,
};
use futures::TryStreamExt;
use geojson::{feature::Id, Feature, FeatureCollection, JsonObject};
use mongodb::{
    bson::{doc, Uuid},
    Database,
};
use serde_json::Value;

use crate::models::ChangingRoom;

static GENERIC_DB_ERROR: LazyLock<(StatusCode, String)> = LazyLock::new(|| {
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        String::from("An unexpected error occured getting data from database"),
    )
});

pub async fn get_all_rooms(
    State(db): State<Database>,
) -> Result<Json<Vec<ChangingRoom>>, (StatusCode, String)> {
    let collection = db.collection::<ChangingRoom>("rooms");

    let rooms = collection
        .find(doc! {})
        .await
        .map_err(|e| {
            tracing::error!(err = e.to_string(), "Unable to get cursor for all rooms");
            GENERIC_DB_ERROR.clone()
        })?
        .try_collect()
        .await
        .map_err(|e| {
            tracing::error!(err = e.to_string(), "Unable to collect rooms into Vec");
            GENERIC_DB_ERROR.clone()
        })?;

    Ok(Json(rooms))
}

pub async fn get_all_rooms_v2(
    State(db): State<Database>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let collection = db.collection::<ChangingRoom>("rooms");

    let rooms: Vec<ChangingRoom> = collection
        .find(doc! {})
        .await
        .map_err(|e| {
            tracing::error!(err = e.to_string(), "Unable to get cursor for all rooms");
            GENERIC_DB_ERROR.clone()
        })?
        .try_collect()
        .await
        .map_err(|e| {
            tracing::error!(err = e.to_string(), "Unable to collect rooms into Vec");
            GENERIC_DB_ERROR.clone()
        })?;

    let rooms_geo = rooms
        .into_iter()
        .filter_map(|r| {
            // ^ Replace with ord map when data migr complete

            // Properties
            let mut props = JsonObject::new();
            props.insert(String::from("roomId"), Value::String(r.id.to_string()));
            props.insert(String::from("name"), Value::String(r.name));
            props.insert(
                String::from("ratings"),
                serde_json::to_value(r.ratings)
                    .inspect_err(|e| {
                        tracing::error!(
                            err = e.to_string(),
                            room_id = r.id.to_string(),
                            "Unable to serialize rating"
                        );
                    })
                    .unwrap(),
            );
            if let Some(ext_id) = r.external_id {
                props.insert(String::from("externalId"), Value::String(ext_id));
            } else {
                props.insert(String::from("externalId"), Value::Null);
            }

            // Geo Feature
            r.location_geo.map(|geo| Feature {
                bbox: None,
                geometry: Some(geo),
                id: Some(Id::String(r.id.to_string())),
                properties: Some(props),
                foreign_members: None,
            })
        })
        .collect::<Vec<_>>();

    Ok((
        StatusCode::OK,
        [(header::CONTENT_TYPE, "application/geo+json")],
        Json(FeatureCollection {
            bbox: None,
            features: rooms_geo,
            foreign_members: None,
        }),
    ))
}

pub async fn get_room_by_id(
    Path(id): Path<String>,
    State(db): State<Database>,
) -> Result<Json<ChangingRoom>, (StatusCode, String)> {
    let id = Uuid::parse_str(&id).map_err(|e| {
        tracing::error!(err = e.to_string(), "Unable to parse uuid from string");
        (
            StatusCode::BAD_REQUEST,
            format!("Id {id} is not correctly formatted. Must be a valid uuid."),
        )
    })?;

    let collection = db.collection::<ChangingRoom>("rooms");
    let result = collection.find_one(doc! { "id": id }).await.map_err(|e| {
        tracing::error!(err = e.to_string(), "Unable to get room by id from db");
        GENERIC_DB_ERROR.clone()
    })?;

    match result {
        Some(room) => Ok(Json(room)),
        None => Err((
            StatusCode::NOT_FOUND,
            format!("No room found with id {id:?}"),
        )),
    }
}
