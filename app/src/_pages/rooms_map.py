from datetime import datetime, timezone

import folium
import streamlit as st
from geojson import Feature, FeatureCollection
from streamlit_folium import st_folium
from streamlit_js_eval import get_geolocation

from src.config import get_app_config
from src.services.room_api import CreateChangingRoom, Location, get_room_api_client

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


def add_room_page_url(features: list[Feature]) -> None:
    for f in features:
        f["properties"]["page_url"] = (
            f'<a href="/room_details?id={f["id"]}" target="_blank"><button>Åpne rom</button></a>'
        )


def set_use_current_location() -> None:
    # streamlit_js_eval doesn't play nicely with st.button, so we we use a flag var instead of getting location directly
    st.session_state["use_current_location"] = True
    st.session_state["use_current_location_clicked_at"] = datetime.now(tz=timezone.utc).isoformat()


def set_adding_changing_room(value: bool) -> None:
    st.session_state["adding_changing_room"] = value


def create_room(name: str, lat: float, lng: float) -> None:
    config = get_app_config()
    room_api = get_room_api_client(config)
    payload = CreateChangingRoom(name=name, location=Location(lat=lat, lng=lng))
    room_api.create_room(payload)

    set_adding_changing_room(value=False)


def main() -> None:
    rooms = get_rooms()
    add_room_ratings_html(rooms.features)
    add_room_page_url(rooms.features)

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

    f_map = folium.Map(
        location=loc,
        zoom_start=zoom,
    )
    folium.GeoJson(
        rooms,
        name="rooms",
        tooltip=folium.GeoJsonTooltip(fields=["name"], aliases=["Navn"]),
        popup=folium.GeoJsonPopup(
            fields=["name", "ratings_html", "page_url"], aliases=["Rom", "Anmeldelser", "Mer info"]
        ),
    ).add_to(f_map)

    if st.session_state.get("adding_changing_room", False) and st.session_state.get("adding_changing_room_loc", False):
        folium.Marker(
            location=st.session_state["adding_changing_room_loc"],
            popup=folium.Popup(html="Valgt plassering", show=True),
            icon=folium.Icon(icon="plus"),
            draggable=False,
        ).add_to(f_map)

    st_map = st_folium(fig=f_map, key="rooms_map", use_container_width=True)

    st.button("Gå til min plassering", icon=":material/near_me:", on_click=set_use_current_location)

    if st.session_state.get("adding_changing_room", False):
        if st_map.get("last_clicked"):
            lat, lng = st_map["last_clicked"]["lat"], st_map["last_clicked"]["lng"]
            if ("adding_changing_room_loc" not in st.session_state or st.session_state["adding_changing_room_loc"]) != [
                lat,
                lng,
            ]:
                st.session_state["adding_changing_room_loc"] = [lat, lng]
                st.session_state["map_zoom"] = st_map["zoom"]
                st.rerun()
        else:
            lat, lng = st.session_state.get("adding_changing_room_loc", [None, None])

        with st.container(border=True):
            st.warning(
                """Det er enda bedre å legge til nye rom direkte i Open Street Map enn her.
Se "Beginners Guide" på [deres nettsider](https://wiki.openstreetmap.org/wiki/Beginners%27_guide) for mer info.

Open Street Map noder i Norge med `changing_table=yes` spesifisert synkroniseres automatisk en gang i døgnet."""
            )

            st.info("Klikk på kartet for å plassere stellerommet")
            add_room_name = st.text_input(label="Navn")
            add_room_col1, add_room_col2 = st.columns(2)
            add_room_col1.button(
                "Avbryt",
                icon=":material/cancel:",
                on_click=set_adding_changing_room,
                args=(False,),
                use_container_width=True,
            )
            add_room_col2.button(
                "Opprett",
                on_click=create_room,
                args=(add_room_name, lat, lng),
                type="primary",
                icon=":material/add:",
                disabled="adding_changing_room_loc" not in st.session_state or not add_room_name,
                use_container_width=True,
            )

    else:
        if st.button("Legg til nytt stellerom", icon=":material/add:", on_click=set_adding_changing_room, args=(True,)):
            st_map["last_clicked"] = None


main()
