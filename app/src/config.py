import streamlit as st
from pydantic import Field
from pydantic_core import Url
from pydantic_settings import BaseSettings


class AppConfig(BaseSettings):
    room_api: Url = Field(default=Url("https://room-api-dev.stellerom.no"))
    review_api: Url = Field(default=Url("https://review-api-dev.stellerom.no"))


@st.cache_resource
def get_app_config() -> AppConfig:
    return AppConfig()
