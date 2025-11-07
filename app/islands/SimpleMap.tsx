import { useEffect, useRef, useState } from "preact/hooks";
import { Map, Marker, TileLayer } from "leaflet";

interface SimpleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
}

export function SimpleMap({ lat, lng, zoom }: SimpleMapProps) {
  zoom ??= 17;

  const mapDiv = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    // Icon.Default.mergeOptions({
    //   iconRetinaUrl: markerIconRetinaUrl,
    //   iconUrl: markerIconUrl,
    //   shadowUrl: markerShadowUrl,
    // });

    const mp = new Map("room-map", {
      center: [lat, lng],
      zoom,
    });

    const tl = new TileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });
    tl.addTo(mp);

    const marker = new Marker([lat, lng]);
    marker.addTo(mp);

    setMap(mp);
  }, []);

  return (
    <>
      <div id="room-map" ref={mapDiv} class="w-full h-96" />
      {map === null && <p>Laster kart...</p>}
    </>
  );
}
