import { useEffect, useRef, useState } from "preact/hooks";
import { Map, Marker, TileLayer } from "leaflet";
import type {
  Map as TMap,
  Marker as TMarker,
  TileLayer as TTileLayer,
} from "leaflet.types";

interface SimpleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
}

export function SimpleMap({ lat, lng, zoom }: SimpleMapProps) {
  zoom ??= 17;

  const mapDiv = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<TMap | null>(null);

  useEffect(() => {
    const mp = new Map("room-map", {
      center: [lat, lng],
      zoom,
    }) as unknown as TMap;

    const tl = new TileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }) as unknown as TTileLayer;
    tl.addTo(mp);

    const marker = new Marker([lat, lng]) as unknown as TMarker;
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
