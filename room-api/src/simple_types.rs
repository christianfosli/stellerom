use serde::Serialize;

#[derive(Clone, Copy, Debug, Serialize)]
pub struct Location {
    pub lat: f64,
    pub lng: f64,
}
