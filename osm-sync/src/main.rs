use std::env;

use geojson::{Geometry, Value};
use models::{ChangingRoom, Location};
use mongodb::bson::{doc, Uuid};
use mongodb::IndexModel;
use mongodb::{options::ClientOptions, Client, Collection, Database};
use osmgraph::api::{OverpassResponse, QueryEngine};
use osmgraph::graph::{get_osm_nodes, OSMNode};

mod models; // models module symlinked from room-api

async fn update_changing_room(
    collection: &Collection<ChangingRoom>,
    existing_doc: &ChangingRoom,
    node: &OSMNode,
) -> Result<(), Box<dyn std::error::Error>> {
    let name = node
        .tags()
        .clone()
        .and_then(|tags| tags.get("name").cloned())
        .unwrap_or_else(|| {
            if existing_doc.name.starts_with("Node ")
                && existing_doc.name.ends_with("from OpenStreetMap")
            {
                // Update name in case node id has changed
                format!("Node {} from OpenStreetMap", node.id())
            } else {
                // Leave existing name in case it has been edited outside of osm
                existing_doc.name.clone()
            }
        });

    let updated = ChangingRoom {
        id: existing_doc.id,
        external_id: Some(format!("osm:{}", node.id())),
        name,
        location: Location {
            lat: node.lat(),
            lng: node.lon(),
        },
        location_geo: Geometry::new(Value::Point(vec![node.lon(), node.lat()])),
        ratings: existing_doc.ratings.clone(),
    };

    collection
        .find_one_and_replace(doc! {"id": existing_doc.id}, updated)
        .await?;
    Ok(())
}

async fn upsert_changing_room(
    collection: &Collection<ChangingRoom>,
    node: &OSMNode,
) -> Result<(), Box<dyn std::error::Error>> {
    if let Some(room) = collection
        .find_one(doc! {"externalId": &format!("osm:{}", node.id())})
        .await?
    {
        tracing::info!(
            "Updating existing room {} {:?}, identified by node id {}",
            room.id,
            room.external_id,
            node.id(),
        );
        update_changing_room(collection, &room, node).await?;
    } else if let Some(room) = collection
        .find_one(doc! {
        "location_geo": doc! {
            "$near": {
                "$geometry": {
                    "type": "Point", "coordinates": [node.lon(), node.lat()]
                },
                "$maxDistance": 10,
            }
        }})
        .await?
    {
        tracing::info!(
            "Updating existing room {} {:?} identified by geo proximity {:?} {:?}",
            room.id,
            room.external_id,
            room.location,
            (node.lon(), node.lat()),
        );
        update_changing_room(collection, &room, node).await?;
    } else {
        tracing::info!(
            "Adding new room for node {} {:?}",
            node.id(),
            (node.lon(), node.lat())
        );
        let name = node
            .tags()
            .clone()
            .and_then(|tags| tags.get("name").cloned())
            .unwrap_or(format!("Node {} from OpenStreetMap", node.id()));

        let room = ChangingRoom {
            id: Uuid::new(),
            external_id: Some(format!("osm:{}", node.id())),
            name,
            location: Location {
                lat: node.lat(),
                lng: node.lon(),
            },
            location_geo: Geometry::new(Value::Point(vec![node.lon(), node.lat()])),
            ratings: None,
        };

        collection.insert_one(&room).await?;
    }
    Ok(())
}

async fn ensure_db_ix(
    collection: &Collection<ChangingRoom>,
) -> Result<(), Box<dyn std::error::Error>> {
    let ix = IndexModel::builder()
        .keys(doc! { "location_geo": "2dsphere"})
        .build();

    let ix = collection.create_index(ix).await?;
    tracing::info!("Created index {} (or verified existence)", ix.index_name);
    Ok(())
}

async fn get_db_handle() -> Result<Database, mongodb::error::Error> {
    let connstr = match env::var("ROOM_API_DB_CONNSTR") {
        Ok(connstr) => connstr,
        Err(e) => {
            tracing::warn!(
                err = e.to_string(),
                "Could not get ROOM_API_DB_CONNSTR from env var. Defaulting to localhost db"
            );
            "mongodb://root:secret@localhost:27017/".to_owned()
        }
    };

    let mongo_client = Client::with_options(ClientOptions::parse(connstr).await?)?;

    let db_name = match env::var("ROOM_API_DB_NAME") {
        Ok(name) => name,
        Err(e) => {
            tracing::info!(
                err = e.to_string(),
                "ROOM_API_DB_NAME not set. Using default name room-api"
            );
            "room-api".to_owned()
        }
    };

    Ok(mongo_client.database(&db_name))
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    let db = get_db_handle().await?;
    let collection = db.collection::<ChangingRoom>("rooms");

    let engine = QueryEngine::new();

    let query = r#"
        [out:json];
        area[name="Norge"]->.a;
        node(area.a)[changing_table=yes];
        out;
    "#
    .to_owned();

    let res = engine.query(query).await?;
    let res = serde_json::from_str::<OverpassResponse>(&res)?;
    let nodes = get_osm_nodes(&res.elements())?;
    tracing::info!("Found {} matching nodes", nodes.len());

    ensure_db_ix(&collection).await?;

    for n in nodes {
        upsert_changing_room(&collection, &n).await?;
    }

    Ok(())
}
