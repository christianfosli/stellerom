from pathlib import Path
import streamlit as st

pages_path = Path(__file__).parent / "src" / "_pages"
pages = {
    "": [
        st.Page(pages_path / "rooms_map.py", title="Kart", icon=":material/travel_explore:", default=True),
        st.Page(pages_path / "room_details.py", title="Se rom", icon=":material/pageview:"),
        st.Page(pages_path / "create_review.py", title="Anmeld rom", icon=":material/rate_review:"),
    ],
    "Admin": [st.Page(pages_path / "create_room.py", title="Opprett stellerom", icon=":material/add_circle:")],
}


def main():
    st.title(":material/baby_changing_station: stellerom.no")
    st.text("Finn og anmeld stellerom")

    pg = st.navigation(pages, expanded=False)
    pg.run()


if __name__ == "__main__":
    main()
