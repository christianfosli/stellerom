/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { tw } from "@twind";
import { Loader } from "https://cdn.pika.dev/google-maps";

interface MapProps {
  apiKey: string | undefined;
}

export default function Map(props: MapProps) {
  const centerNorway = {
    lat: 64.68,
    lng: 9.39,
  };

  const loader = new Loader(
    props.apiKey,
    {},
  );

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const renderMap = async () => {
      const google = await loader.load();
      const map = new google.maps.Map(mapContainer.current, {
        center: centerNorway,
        zoom: 4,
      });
    };

    renderMap()
      .then(() => {
        console.info("Map rendered");
        setIsLoaded(true);
      })
      .catch(console.error);
  }, []);

  return (
    <div ref={mapContainer} class={tw`w-full h-96`}>
      {isLoaded && <></> || <p>Laster kart...</p>}
    </div>
  );
}
