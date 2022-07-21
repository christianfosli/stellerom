use room_service::{room_service_client::RoomServiceClient, GetRoomsRequest};
use tonic::Request;

pub mod room_service {
    tonic::include_proto!("room_service");
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut client = RoomServiceClient::connect("http://[::1]:50051").await?;
    let res = client.get_rooms(Request::new(GetRoomsRequest {})).await?;
    println!("{:?}", res);
    Ok(())
}
