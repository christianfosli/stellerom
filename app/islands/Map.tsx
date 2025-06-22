import { useEffect, useRef, useState } from "preact/hooks";
import { Feature, FeatureCollection } from "geojson";
import { Circle, GeoJSON, Map, Popup, TileLayer } from "leaflet";
import type {
  Circle as TCircle,
  ErrorEvent,
  GeoJSON as TGeoJson,
  Layer,
  LeafletMouseEvent,
  LeafletMouseEventHandlerFn,
  LocationEvent,
  Map as TMap,
  Popup as TPopup,
  TileLayer as TTileLayer,
} from "leaflet.types";
// ^ TODO: Check if type imports become unneccesary when leaflet 2 is stable and @types/leaflet@2 is out

interface MapProps {
  changingRooms: FeatureCollection;
}

const centerOfNorway = { lat: 64.68, lng: 9.39 };
const defaultZoom = 4;
const localStorageMapPosKey = "mapPosition";

export default function MyMap(props: MapProps) {
  const mapDiv = useRef<HTMLDivElement | null>(null);

  // deno-lint-ignore no-explicit-any
  const [map, setMap] = useState<any>(null);
  const [err, setErr] = useState<string>("");
  const [addingChangingRoom, setAddingChangingRoom] = useState<
    {
      active: boolean;
      listener: LeafletMouseEventHandlerFn | null;
      popup: TPopup | null;
    }
  >({ active: false, listener: null, popup: null });

  useEffect(() => {
    console.info("Loading initial map");
    const lastMapPos = localStorage.getItem(localStorageMapPosKey);
    console.log(lastMapPos);

    const { center, zoom }: {
      center: { lat: number; lng: number };
      zoom: number;
    } = lastMapPos
      ? JSON.parse(lastMapPos)
      : { center: centerOfNorway, zoom: defaultZoom };

    const mp: TMap = new Map("roomsmap", {
      center: [center.lat, center.lng],
      zoom,
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: "topleft",
      },
    }) as unknown as TMap;

    (new TileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }) as unknown as TTileLayer).addTo(mp);

    const onEachFeature = (feature: Feature, layer: Layer) => {
      const ratingsHtml = feature.properties.ratings
        ? `<ul class="list-disc py-2">
            <li>Tilgjengelighet ${feature.properties.ratings?.availability}/5</li>
            <li>Sikkerhet ${feature.properties.ratings?.safety}/5</li>
            <li>Renslighet ${feature.properties.ratings?.cleanliness}/5</li>
          </ul>`
        : "<p>Ingen anmeldelser</p>";
      layer.bindPopup(`<h3 class="text-lg">${feature.properties.name}</h3>
        ${ratingsHtml}
        <a href="/rooms/${feature.id}">
        <button class="bg-gray-300 p-2 rounded-md border border-gray-700 font-semibold">
          Gå til rom
        </button>
        </a>`);
    };

    (new GeoJSON(props.changingRooms, {
      onEachFeature,
    }) as unknown as TGeoJson).addTo(mp);

    mp.on(
      "locationfound",
      (e: LocationEvent) =>
        (new Circle(e.latlng, e.accuracy) as unknown as TCircle).addTo(mp),
    );

    mp.on("locationerror", (e: ErrorEvent) => setErr(e.message));

    setMap(mp);
  }, []);

  const showCurrentLocation = () => {
    map.locate({ setView: true, maxZoom: 18 });
  };

  const startAddingChangingRoom = () => {
    const popup = new Popup() as unknown as TPopup;
    const onClick = (e: LeafletMouseEvent) =>
      popup.setLatLng(e.latlng)
        .setContent(
          `<div>
           <h3 class="text-md font-bold">Nytt stellerom</h3>
           <p>
             Klikk på &quot;Fortsett&quot; om du er fornøyd med plasseringen.
           </p>
           <p class="fond-semibold">
             Appen henter nå også data om stellerom fra <a href="https://www.openstreetmap.org/">OpenStreetMap</a>.
             Vurder å legge inn stellerom der først, med &quot;changing_table=yes&quot; så vil den dukke opp her automatisk ila ett døgn.
           </p>
            <a href="/new-room?lat=${e.latlng.lat}&lng=${e.latlng.lng}">
           <button class="bg-gray-300 p-2 rounded-md border border-gray-700 font-semibold">
            Fortsett
          </button>
          </a>
         </div>`,
        ).openOn(map);
    map.on("click", onClick);
    setAddingChangingRoom({ active: true, listener: onClick, popup: popup });
    console.info("Listening for clicks for adding changing room");
  };

  const stopAddingChangingRoom = () => {
    map.off("click", addingChangingRoom.listener);
    if (addingChangingRoom.popup?.isOpen()) {
      addingChangingRoom.popup.close();
    }

    setAddingChangingRoom({ active: false, listener: null, popup: null });
    console.info("Removed click listener for adding changing rooms");
  };

  const infoMsg = map === null
    ? "Laster kart..."
    : addingChangingRoom.active
    ? "Legg til stellerom - plasser rommet på kartet"
    : "Finn og anmeld stellerom";

  return (
    <div>
      <p
        class={`transition-color ease-in-out duration-200 ${
          addingChangingRoom.active ? "bg-yellow-200" : "bg-transparent"
        }`}
      >
        {infoMsg}
      </p>
      <p
        class={`transition-color ease-in-out duration-200 ${
          err ? "bg-red-400" : "bg-transparent"
        }`}
      >
        {err}
      </p>
      <div ref={mapDiv} class="w-full h-96" id="roomsmap">
      </div>
      <button
        class="inline-block bg-gray-300 p-2 rounded-md border border-gray-700"
        type="button"
        onClick={showCurrentLocation}
      >
        Gå til min plassering
      </button>
      {addingChangingRoom.active && (
            <button
              class="inline-block bg-yellow-400 p-2 rounded-md border border-gray-700"
              type="button"
              onClick={stopAddingChangingRoom}
            >
              Avbryt legg til stellerom
            </button>
          ) || (
        <button
          class="inline-block bg-gray-300 p-2 rounded-md border border-gray-700"
          type="button"
          onClick={startAddingChangingRoom}
        >
          Legg til nytt stellerom
        </button>
      )}
    </div>
  );
}
