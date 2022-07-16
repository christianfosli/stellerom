/** @jsx h */
import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { tw } from "@twind";
import { Loader } from "@googlemaps/js-api-loader";

interface MapProps {
  apiKey: string;
}

const centerOfNorway = { lat: 64.68, lng: 9.39 };

export default function MyMap(props: MapProps) {
  const mapDiv = useRef<HTMLDivElement | null>(null);

  // loaded by js-api-loader, I counldn't find out how to get type for typescript
  // deno-lint-ignore no-explicit-any
  const [google, setGoogle] = useState<Record<string, any> | null>(null);

  // map type from google maps API. I couldn't figure out how to get type into typescript
  // deno-lint-ignore no-explicit-any
  const [map, setMap] = useState<any>(null);

  const [center, setCenter] = useState(centerOfNorway);
  const [zoom, setZoom] = useState(4);

  useEffect(() => {
    const load = async () => {
      const loader = new Loader({
        apiKey: props.apiKey,
        version: "weekly",
      });

      const google = await loader.load();
      console.info("Google maps loaded");

      setGoogle(google);
    };

    load().catch(console.error);
  }, [props.apiKey]);

  useEffect(() => {
    if (google === null) {
      return;
    }

    if (map === null) {
      setMap(new google.maps.Map(mapDiv.current, { center, zoom }));
      console.info("Map rendered initially");
    } else {
      map.setCenter(center);
      map.setZoom(zoom);
      console.info("Map updated");
    }
  }, [google, center, zoom]);

  const goToCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setZoom(17);
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
        onClick={goToCurrentLocation}
      >
        Naviger til min plassering
      </button>
    </div>
  );
}
