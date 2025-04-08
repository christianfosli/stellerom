import { useEffect, useRef, useState } from "preact/hooks";
import { Feature, FeatureCollection } from "geojson";
import { Layer } from "leaflet";

interface MapProps {
  apiKey: string;
  changingRooms: FeatureCollection;
}

const centerOfNorway = { lat: 64.68, lng: 9.39 };
const defaultZoom = 4;
const localStorageMapPosKey = "mapPosition";

export default function MyMap(props: MapProps) {
  // const Leaflet = IS_BROWSER ? lazy(() => import("leaflet")) : null; // Try to work around window is not defined error during SSR but it doesn't work properly

  const mapDiv = useRef<HTMLDivElement | null>(null);

  // deno-lint-ignore no-explicit-any
  const [L, setL] = useState<any>(null); // work-around for window is not defined during SSR
  // deno-lint-ignore no-explicit-any
  const [map, setMap] = useState<any>(null);
  // deno-lint-ignore no-explicit-any
  const [addingChangingRoom, setAddingChangingRoom] = useState<
    // deno-lint-ignore no-explicit-any
    { active: boolean; listener: any }
  >({ active: false, listener: null });

  const leafletLoaded = !(L === null);

  useEffect(() => {
    // Import leaflet and set L (hopefully no longer needed when leaflet 2.0 release)
    const importLeaflet = async () => {
      const leaflet = await import("leaflet");
      const L = leaflet.default;
      console.info(`Loaded leaflet ${L.version}`);
      setL(L);
    };
    importLeaflet();
  }, []);

  useEffect(() => {
    // Initial map render
    if (L === null) {
      return;
    }

    console.info("Loading initial map");
    const lastMapPos = localStorage.getItem(localStorageMapPosKey);
    console.log(lastMapPos);

    const { center, zoom }: {
      center: { lat: number; lng: number };
      zoom: number;
    } = lastMapPos
      ? JSON.parse(lastMapPos)
      : { center: centerOfNorway, zoom: defaultZoom };

    const mp = L.map("roomsmap", { center: [center.lat, center.lng], zoom });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mp);

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
        <a href="/rooms/${feature.id}"><button class="p-3 shadow-md">Åpne rom</button></a>`);
    };

    L.geoJSON(props.changingRooms, {
      onEachFeature,
    }).addTo(mp);

    setMap(mp);
  }, [leafletLoaded]);

  const showCurrentLocation = () => {
    alert("Not implemented");
  };

  const startAddingChangingRoom = () => {
    alert("Not implemented");
  };

  const stopAddingChangingRoom = () => {
    alert("Not implemented");
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

function _OrigMap(props: MapProps) {
  const mapDiv = useRef<HTMLDivElement | null>(null);

  // I couldn't figure out how to get objects loaded by Google Maps JavaScript API
  // into TypeScript types. Therefore some `any`'s below...

  // deno-lint-ignore no-explicit-any
  const [google, setGoogle] = useState<Record<string, any> | null>(null);
  // deno-lint-ignore no-explicit-any
  const [map, setMap] = useState<any>(null);
  // deno-lint-ignore no-explicit-any
  const [infoWindow, setInfoWindow] = useState<any>(null);
  const [addingChangingRoom, setAddingChangingRoom] = useState<
    // deno-lint-ignore no-explicit-any
    { active: boolean; listener: any }
  >({ active: false, listener: null });

  useEffect(() => {
    // Load google maps JS API
    const load = async () => {
      const loader = new Loader({
        apiKey: props.apiKey,
        version: "weekly",
      });

      const google = await loader.load();
      console.info("Google maps API loaded");

      setGoogle(google);
    };

    load().catch(console.error);
  }, [props.apiKey]);

  useEffect(() => {
    // Initial render of google maps map

    if (google === null) {
      return;
    }

    const lastMapPos = localStorage.getItem(localStorageMapPosKey);
    console.info(`mapPosition loaded from localStorage: ${lastMapPos}`);

    const { center, zoom }: {
      center: { lat: number; lng: number };
      zoom: number;
    } = lastMapPos
      ? JSON.parse(lastMapPos)
      : { center: centerOfNorway, zoom: defaultZoom };

    const mp = new google.maps.Map(mapDiv.current, { center, zoom });
    const iw = new google!.maps.InfoWindow();

    setMap(mp);
    setInfoWindow(iw);

    const roomMarkers = props.changingRooms.map((r) => {
      const mark = new google.maps.Marker({
        position: r.location,
        // TODO: We can add a custom icon resembling a changing room here
        map: mp,
      });

      mark.addListener("click", () => {
        iw.setContent(
          `<div>
            <h3 class="${tw`text-md font-bold`}">${r.name}</h3>
            ${
            r.ratings
              ? `<ul class="max-w-sm list-none py-2 text-sm">
                  <li>Tilgjengelighet ${r.ratings.availability}/5</li>
                  <li>Sikkerhet ${r.ratings.safety}/5</li>
                  <li>Renslighet ${r.ratings.cleanliness}/5</li>
                </ul>`
              : `<p class="text-sm max-w-sm">Ingen anmeldelser enda..</p>`
          }
            <a href="/rooms/${r.id}">
              <button class="bg-gray-300 p-2 rounded-md border border-gray-700">
                Gå til rom
              </button>
            </a>
          </div>`,
        );
        iw.open(mp, mark);
      });

      return mark;
    });

    console.info(
      `Map of ${props.changingRooms.length} rooms rendered`,
    );

    return () => {
      roomMarkers.forEach((r) => r.setMap(null));
      setMap(null);
    };
  }, [google, props.changingRooms]);

  useEffect(() => {
    if (map === null || map === undefined) return;

    const storeMapPos = () => {
      const { center, zoom } = map;
      localStorage.setItem(
        localStorageMapPosKey,
        JSON.stringify({ center, zoom }),
      );
    };

    const timerId = setInterval(storeMapPos, 2000);
    return () => clearInterval(timerId);
  }, [map]);

  const showCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (navPosition) => {
        const position = {
          lat: navPosition.coords.latitude,
          lng: navPosition.coords.longitude,
        };
        console.info(
          `Got current location ${JSON.stringify(position)} from browser`,
        );

        infoWindow.setPosition(position);
        infoWindow.setContent(
          `<h3 class="text-md font-bold">Du er her</h3>`,
        );
        map.setCenter(position);
        map.setZoom(17);
        infoWindow.open(map);
      },
      (error) => console.error(error),
    );
  };

  const startAddingChangingRoom = () => {
    // deno-lint-ignore no-explicit-any
    const listener = map.addListener("click", (evt: any) => {
      const lat = evt.latLng.lat();
      const lng = evt.latLng.lng();
      infoWindow.setContent(
        `<div>
           <h3 class="text-md font-bold">Nytt stellerom</h3>
           <p>
             Klikk på &quot;Fortsett&quot; om du er fornøyd med plasseringen.
           </p>
           <p class="fond-semibold">
             Appen henter nå også data om stellerom fra <a href="https://www.openstreetmap.org/">OpenStreetMap</a>.
             Vurder å legge inn stellerom der først, med &quot;changing_table=yes&quot; så vil den dukke opp her automatisk ila ett døgn.
           </p>
            <a href="/new-room?lat=${lat}&lng=${lng}">
           <button class="bg-gray-300 p-2 rounded-md border border-gray-700">
          Fortsett
          </button>
          </a>
         </div>`,
      );
      infoWindow.setPosition({ lat, lng });
      infoWindow.open(map);
    });
    setAddingChangingRoom({ active: true, listener });
    console.info("Listening for clicks for adding changing room");
  };

  const stopAddingChangingRoom = () => {
    google!.maps.event.removeListener(addingChangingRoom.listener);
    console.info("Removed click listener for adding changing rooms");

    if (infoWindow.open) {
      infoWindow.close();
    }

    setAddingChangingRoom({ active: false, listener: null });
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
      <div ref={mapDiv} class="w-full h-96">
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
