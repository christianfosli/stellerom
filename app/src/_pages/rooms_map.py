from datetime import datetime, timezone
from geojson import Feature, FeatureCollection
import streamlit as st
from streamlit_js_eval import get_geolocation
import pydeck as pdk


from src.config import get_app_config
from src.services.room_api import get_room_api_client


DEFAULT_VIEW_STATE = pdk.ViewState(
    latitude=64.68,
    longitude=9.39,
    zoom=4,
)


def get_rooms() -> FeatureCollection:
    config = get_app_config()
    room_api = get_room_api_client(config)
    return room_api.get_all_rooms()


def add_room_ratings_html(features: list[Feature]) -> None:
    for f in features:
        if ratings := f["properties"]["ratings"]:
            st.write(ratings)
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
            initial_view_state = pdk.ViewState(
                latitude=current_location["coords"]["latitude"],
                longitude=current_location["coords"]["longitude"],
                zoom=15,
            )
        else:
            initial_view_state = DEFAULT_VIEW_STATE
    else:
        initial_view_state = DEFAULT_VIEW_STATE

    deck = pdk.Deck(
        map_style=None,  # type: ignore
        initial_view_state=initial_view_state,
        tooltip={"html": " <h3>{name}</h3>\n{ratings_html}"},  # type: ignore
        layers=[
            pdk.Layer(
                "GeoJsonLayer",
                data=rooms,
                pickable=True,
                get_fill_color=[255, 255, 255, 127],
                get_line_color=[255, 255, 255, 255],
                get_point_radius=20,
                point_radius_min_pixels=12,
            ),
        ],
    )

    pdk_state = st.pydeck_chart(deck, use_container_width=True, on_select="rerun")
    if "selection" in pdk_state:
        print(pdk_state["selection"])

    st.button("Gå til min plassering", icon=":material/near_me:", on_click=set_use_current_location)


main()