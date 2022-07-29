use mongodb::bson::Uuid;
use serde::{Deserialize, Serialize};

use crate::simple_types::Location;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ChangingRoom {
    pub id: Uuid,
    pub name: String,
    pub location: Location,
}
