from datetime import datetime, timezone

import folium
import streamlit as st
from geojson import Feature, FeatureCollection
from streamlit_folium import st_folium
from streamlit_js_eval import get_geolocation

from src.config import get_app_config
from src.services.room_api import get_room_api_client

DEFAULT_LOCATION = 64.68, 9.39  # Norway
DEFAULT_ZOOM = 4


def get_rooms() -> FeatureCollection:
    config = get_app_config()
    room_api = get_room_api_client(config)
    return room_api.get_all_rooms()


def add_room_ratings_html(features: list[Feature]) -> None:
    for f in features:
        if ratings := f["properties"]["ratings"]:
            f["properties"]["ratings_html"] = f"""
                <ul>
                    <li>Tilgjengelighet: {ratings["availability"]}/5</li>
                    <li>Sikkerhet {ratings["safety"]}/5</li>
                    <li>Renslighet {ratings["cleanliness"]}/5</li>
                </ul>
            """
        else:
            f["properties"]["ratings_html"] = "<p>Ingen anmeldelser enda.</p>"


def set_use_current_location() -> None:
    # streamlit_js_eval doesn't play nicely with st.button, so we we use a flag var instead of getting location directly
    st.session_state["use_current_location"] = True
    st.session_state["use_current_location_clicked_at"] = datetime.now(tz=timezone.utc).isoformat()


def main() -> None:
    rooms = get_rooms()
    add_room_ratings_html(rooms.features)

    if st.session_state.get("use_current_location", False):
        current_location = get_geolocation(component_key=st.session_state["use_current_location_clicked_at"])
        if current_location is not None:
            loc: tuple[float, float] = (current_location["coords"]["latitude"], current_location["coords"]["longitude"])
            zoom = 15
        else:
            loc = DEFAULT_LOCATION
            zoom = DEFAULT_ZOOM
    else:
        loc = DEFAULT_LOCATION
        zoom = DEFAULT_ZOOM

    map = folium.Map(
        location=loc,
        zoom_start=zoom,
    )
    folium.GeoJson(
        rooms,
        name="rooms",
        tooltip=folium.GeoJsonTooltip(fields=["name"], aliases=["Navn"]),
        popup=folium.GeoJsonPopup(fields=["name", "ratings_html"], aliases=["Rom", "Anmeldelser"]),
    ).add_to(map)
    st_data = st_folium(map, use_container_width=True)
    st.button("Gå til min plassering", icon=":material/near_me:", on_click=set_use_current_location)

    # if "last_active_drawing" in st_data and st_data["last_active_drawing"]:
    # sel_room_id = st_data["last_active_drawing"]["id"]
    # sel_room_props = st_data["last_active_drawing"]["properties"]

    # with st.container(border=True):
    #     st.subheader(sel_room_props["name"])
    #     st.html(sel_room_props["ratings_html"])
    #     st.markdown(f"[Gå til rom](/room_details?id={sel_room_id})")
    # We need to use an ordinary link rather than st.page_link due to https://github.com/streamlit/streamlit/issues/8112
    # st.page_link(app.pages_path / "room_details.py", label="Gå til rom", icon=":material/pageview:")

    st.write(st_data)


main()
