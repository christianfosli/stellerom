from pydantic_core import Url
from requests import Session


class ReviewApi(Session):
    def __init__(self, base_url: Url) -> None:
        super().__init__()
        self.base_url = base_url
