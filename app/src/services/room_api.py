from datetime import timedelta
from pydantic_core import Url
from requests import Session
import streamlit as st
import geojson
from geojson import FeatureCollection

from src.config import AppConfig


###################
# Contract Models #
###################

# StarRating = Annotated[int, conint(ge=0, le=5)]


# @dataclass
# class Ratings:
#     availability: StarRating | None
#     safety: StarRating | None
#     cleanliness: StarRating | None


# @dataclass
# class Location:
#     lat: float
#     lng: float


# class ChangingRoom(BaseModel):
#     id: UUID
#     name: str
#     location: Location
#     locationGeo: Geometry
#     ratings: Ratings | None
#     externalId: str | None


##########
# Client #
##########


class RoomApi(Session):
    def __init__(self, base_url: Url) -> None:
        super().__init__()
        self.base_url = base_url

    @st.cache_data(ttl=timedelta(hours=1), hash_funcs={"src.services.room_api.RoomApi": lambda _: None})
    def get_all_rooms(self) -> FeatureCollection:
        res = self.get(f"{self.base_url}/rooms-v2")
        res.raise_for_status()
        features = geojson.loads(res.text)
        assert isinstance(features, FeatureCollection), "Unexpected result type from room API"

        return features


def _hash_func(config: AppConfig) -> str:
    return str(config.room_api)


@st.cache_resource(hash_funcs={AppConfig: _hash_func})
def get_room_api_client(config: AppConfig) -> RoomApi:
    return RoomApi(base_url=config.room_api)
