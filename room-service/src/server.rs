use room_service::{
    room_service_server::{RoomService, RoomServiceServer},
    AddRoomRequest, ChangingRoom, GetRoomsReply, GetRoomsRequest, Location,
};
use tonic::{transport::Server, Request, Response, Status};

pub mod room_service {
    tonic::include_proto!("room_service");
}

#[derive(Debug, Default)]
pub struct MyRoomService {}

#[tonic::async_trait]
impl RoomService for MyRoomService {
    async fn get_rooms(
        &self,
        _request: Request<GetRoomsRequest>,
    ) -> Result<Response<GetRoomsReply>, Status> {
        let reply = GetRoomsReply {
            rooms: vec![ChangingRoom {
                id: "abc123".to_owned(),
                name: "".to_owned(),
                location: Some(Location {
                    lat: 50.0,
                    lng: 65.0,
                }),
            }],
        };

        Ok(Response::new(reply))
    }
    async fn add_room(&self, _request: Request<AddRoomRequest>) -> Result<Response<()>, Status> {
        unimplemented!();
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr = "[::1]:50051".parse()?;
    let room_service = MyRoomService::default();

    Server::builder()
        .add_service(RoomServiceServer::new(room_service))
        .serve(addr)
        .await?;

    Ok(())
}
