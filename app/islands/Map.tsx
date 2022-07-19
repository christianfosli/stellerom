/** @jsx h */
import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { tw } from "@twind";
import { Loader } from "@googlemaps/js-api-loader";
import { ChangingRoom } from "../routes/index.tsx";

interface MapProps {
  apiKey: string;
  changingRooms: ChangingRoom[];
}

const centerOfNorway = { lat: 64.68, lng: 9.39 };
const defaultZoom = 4;

export default function MyMap(props: MapProps) {
  const mapDiv = useRef<HTMLDivElement | null>(null);

  // I couldn't figure out how to get objects loaded by Google Maps JavaScript API
  // into TypeScript types. Therefore some `any`'s below...

  // deno-lint-ignore no-explicit-any
  const [google, setGoogle] = useState<Record<string, any> | null>(null);
  // deno-lint-ignore no-explicit-any
  const [map, setMap] = useState<any>(null);
  // deno-lint-ignore no-explicit-any
  const [infoWindow, setInfoWindow] = useState<any>(null);

  useEffect(() => {
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
    if (google === null) {
      return;
    }

    const mp = new google.maps.Map(mapDiv.current, {
      center: centerOfNorway,
      zoom: defaultZoom,
    });
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
          `<h3 class="${tw`text-md font-bold`}">${r.name}</h3>`,
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
          `<h3 class="${tw`text-md font-bold`}">Du er her</h3>`,
        );
        map.setCenter(position);
        map.setZoom(17);
        infoWindow.open(map);
      },
      (error) => console.error(error),
    );
  };

  return (
    <div>
      <div ref={mapDiv} class={tw`w-full h-96`}>
        {map === null && <p>Laster kart...</p>}
      </div>
      <button
        class={tw
          `inline-block bg-gray-300 p-2 rounded-md border border-gray-700`}
        type="button"
        onClick={showCurrentLocation}
      >
        Gå til min plassering
      </button>
    </div>
  );
}
