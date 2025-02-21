from dataclasses import dataclass
from datetime import timedelta
from typing import Annotated
from uuid import UUID
from pydantic import BaseModel, conint
from pydantic_core import Url
from requests import HTTPError, Session
from requests.adapters import HTTPAdapter
import streamlit as st
import geojson
from geojson import FeatureCollection
from streamlit.runtime.caching.cache_utils import BoundCachedFunc, CachedFunc

from src.config import AppConfig


###################
# Contract Models #
###################

StarRating = Annotated[int, conint(ge=1, le=5)]


@dataclass
class Ratings:
    availability: StarRating | None
    safety: StarRating | None
    cleanliness: StarRating | None


@dataclass
class Location:
    lat: float
    lng: float


class CreateChangingRoom(BaseModel):
    name: str
    location: Location


class ChangingRoom(BaseModel):
    id: UUID
    name: str
    location: Location
    # locationGeo: Geometry
    ratings: Ratings | None
    externalId: str | None


##########
# Client #
##########


class RoomApi(Session):
    def __init__(self, base_url: Url) -> None:
        super().__init__()
        self.base_url = base_url
        self.mount(str(base_url), HTTPAdapter(max_retries=3))

    @st.cache_data(ttl=timedelta(hours=1), hash_funcs={"src.services.room_api.RoomApi": lambda _: None})
    def get_all_rooms(self) -> FeatureCollection:
        try:
            with st.spinner("Laster stellerom..."):
                res = self.get(f"{self.base_url}/rooms-v2")

            res.raise_for_status()
            features = geojson.loads(res.text)
            assert isinstance(features, FeatureCollection), "Unexpected result type from room API"

            return features

        except HTTPError as e:
            st.error(
                f"**An error occured fetching changing rooms. Status code {e.response.status_code}**\n\nResponse text:\n{e.response.text}"
            )
            raise

    def get_room_by_id(self, id: str) -> ChangingRoom:
        try:
            with st.spinner("Laster stellerom..."):
                res = self.get(f"{self.base_url}/rooms/{id}")
            res.raise_for_status()
            room = ChangingRoom.model_validate_json(res.text)
            return room
        except HTTPError as e:
            st.error(
                f"**An error occured fetching changing room. Status code {e.response.status_code}**\n\nResponse text:\n{e.response.text}"
            )
            raise

    def create_room(self, room: CreateChangingRoom) -> None:
        try:
            with st.spinner("Laster stellerom..."):
                res = self.post(f"{self.base_url}/rooms", json=room.model_dump(mode="json"))
            res.raise_for_status()

            # Clear memory cache upon successful create
            assert isinstance(self.get_all_rooms, BoundCachedFunc)
            self.get_all_rooms.clear()
        except HTTPError as e:
            st.error(
                f"**An error occured fetching changing room. Status code {e.response.status_code}**\n\nResponse text:\n{e.response.text}"
            )
            raise


###########
# Helpers #
###########


def _hash_func(config: AppConfig) -> str:
    return str(config.room_api)


@st.cache_resource(hash_funcs={AppConfig: _hash_func})
def get_room_api_client(config: AppConfig) -> RoomApi:
    return RoomApi(base_url=config.room_api)
