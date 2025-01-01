from uuid import UUID
from zoneinfo import ZoneInfo

import streamlit as st
import pandas as pd

import app
from src.config import get_app_config
from src.services.room_api import get_room_api_client
from src.services.review_api import CreateReview, ReviewApi, get_review_api_client


def _on_review_submit(room_id: str, api: ReviewApi) -> None:
    review = CreateReview(
        roomId=UUID(room_id),
        availabilityRating=st.session_state[f"review-avail-{room_id}"] + 1,
        safetyRating=st.session_state[f"review-safety-{room_id}"] + 1,
        cleanlinessRating=st.session_state[f"review-clean-{room_id}"] + 1,
        review=st.session_state[f"review-text-{room_id}"],
        imageUrl=None,
        reviewedBy=st.session_state[f"review-author-{room_id}"] or None,
    )
    api.create_review(review)
    st.session_state[f"review-created-{room_id}"] = True


def create_review_form(room_id: str, api: ReviewApi) -> None:
    with st.form(f"review-{room_id}"):
        st.subheader("Din anmeldelse")
        avail_col_1, avail_col_2 = st.columns(2)
        avail_col_1.write("Tilgjengelighet")
        avail_col_2.feedback(options="stars", key=f"review-avail-{room_id}")

        safety_col_1, safety_col_2 = st.columns(2)
        safety_col_1.write("Sikkerhet")
        safety_col_2.feedback(options="stars", key=f"review-safety-{room_id}")

        clean_col_1, clean_col_2 = st.columns(2)
        clean_col_1.write("Renslighet")
        clean_col_2.feedback(options="stars", key=f"review-clean-{room_id}")

        st.text_area(label="Kommentar", key=f"review-text-{room_id}")
        st.text_input(label="Navn (frivillig)", key=f"review-author-{room_id}")

        st.form_submit_button("Send", on_click=_on_review_submit, args=(room_id, api))


def main() -> None:
    if "id" not in st.query_params:
        st.error("Mangler info om hvilket rom du vil se på. Gå tilbake til kartet for å velge rom.")
        st.page_link(page=app.pages_path / "rooms_map.py", label="Tilbake til kartet", icon=":material/travel_explore:")
        return

    room_id = st.query_params["id"]

    config = get_app_config()
    room_api = get_room_api_client(config)
    room = room_api.get_room_by_id(room_id)

    st.title(f"Stellerom {room.name}")
    st.map(pd.DataFrame({"lat": [room.location.lat], "lon": [room.location.lng]}))

    if room.ratings:
        avail_col, safety_col, clean_col = st.columns(3)
        avail_col.metric(label="Tilgjengelighet", value=f"{room.ratings.availability}/5")
        safety_col.metric(label="Sikkerhet", value=f"{room.ratings.safety}/5")
        clean_col.metric(label="Renslighet", value=f"{room.ratings.cleanliness}/5")
    else:
        st.info("Dette rommet har ingen anmeldelser enda")

    st.subheader("Anmeldelser")
    review_api = get_review_api_client(config)
    reviews = review_api.get_reviews(room_id)

    reviews_df = pd.DataFrame(
        [
            {
                "Tilgjengelighet": r.availabilityRating,
                "Sikkerhet": r.safetyRating,
                "Renslighet": r.cleanlinessRating,
                "Kommentar": r.review,
                "Anmeldt tid": r.reviewedAt.astimezone(ZoneInfo("Europe/Oslo")),
                "Anmeldt av": r.reviewedBy,
            }
            for r in reviews
        ]
    )
    star_rating_col_conf = st.column_config.ProgressColumn(min_value=0, max_value=5, width="small", format="%f/5")
    st.dataframe(
        reviews_df,
        use_container_width=True,
        hide_index=True,
        column_config={
            "Tilgjengelighet": star_rating_col_conf,
            "Sikkerhet": star_rating_col_conf,
            "Renslighet": star_rating_col_conf,
        },
    )

    if f"review-created-{room_id}" in st.session_state:
        st.info("Anmeldelse opprettet")
        st.button("Rediger anmeldelse {IKKE IMPLEMENTERT ENDA}", disabled=True)
        st.button("Opprett enda en anmeldelse", on_click=lambda: st.session_state.pop(f"review-created-{room_id}"))
    else:
        create_review_form(room_id=room_id, api=review_api)


main()
