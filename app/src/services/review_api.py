from uuid import UUID
from pydantic import AwareDatetime, BaseModel, TypeAdapter
from requests.adapters import HTTPAdapter
import streamlit as st
from pydantic_core import Url
from requests import HTTPError, Session

from src.config import AppConfig
from src.services.room_api import StarRating


###################
# Contract Models #
###################


class CreateReview(BaseModel):
    roomId: UUID
    availabilityRating: StarRating
    safetyRating: StarRating
    cleanlinessRating: StarRating
    review: str | None
    imageUrl: str | None
    reviewedBy: str | None


class Review(BaseModel):
    roomId: UUID
    availabilityRating: StarRating
    safetyRating: StarRating
    cleanlinessRating: StarRating
    review: str | None
    imageUrl: str | None
    reviewedAt: AwareDatetime
    reviewedBy: str | None


##########
# Client #
##########


class ReviewApi(Session):
    def __init__(self, base_url: Url) -> None:
        super().__init__()
        self.base_url = base_url
        self.mount(str(base_url), HTTPAdapter(max_retries=3))

    def get_reviews(self, room_id: str) -> list[Review]:
        try:
            with st.spinner("Laster anmeldelser..."):
                res = self.get(f"{self.base_url}/reviews", params={"roomId": room_id})
            res.raise_for_status()
            ta = TypeAdapter(list[Review])
            return ta.validate_json(res.text)
        except HTTPError as e:
            st.error(
                f"**An error occured fetching reviews. Status code {e.response.status_code}.**\n\nResponse text\n{e.response.text}"
            )
            raise

    def create_review(self, review: CreateReview) -> Review:
        try:
            with st.spinner("Prosesserer anmeldelse..."):
                res = self.post(f"{self.base_url}/reviews", json=review.model_dump(mode="json"))
            res.raise_for_status()
            created = Review.model_validate_json(res.text)
            return created
        except HTTPError as e:
            st.error(
                f"**An error occured creating review. Status code {e.response.status_code}.**\n\nResponse text:\n{e.response.text}"
            )
            raise


###########
# Helpers #
###########


def _hash_func(config: AppConfig) -> str:
    return str(config.review_api)


@st.cache_resource(hash_funcs={AppConfig: _hash_func})
def get_review_api_client(config: AppConfig) -> ReviewApi:
    return ReviewApi(base_url=config.review_api)
