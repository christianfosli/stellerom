import { useEffect, useRef, useState } from "preact/hooks";
import { ChangingRoom } from "../utils/models.ts";
import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import Geolocation from "ol/Geolocation.js";
import { Circle, Fill, Stroke, Style } from "ol/style.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import { useGeographic } from "ol/proj.js";

interface MapProps {
  changingRooms: ChangingRoom[];
}

const centerOfNorway = { lat: 64.68, lng: 9.39 };
const defaultZoom = 4;

export default function MyMap(props: MapProps) {
  const mapDiv = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState<View>();
  const [map, setMap] = useState<Map>();
  const [geoLocation, setGeoLocation] = useState<Geolocation>();
  const [geoLayer, setGeoLayer] = useState<VectorLayer>();

  useEffect(() => {
    // Initialize map

    useGeographic();

    const view = new View({
      center: [centerOfNorway.lng, centerOfNorway.lat],
      zoom: defaultZoom,
    });

    const map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: mapDiv.current || "",
      view,
    });

    setView(view);
    setMap(map);

    return () => map.setTarget("");
  }, []);

  const trackPosition = () => {
    if (!view || !map) {
      console.error("Unable to track position because map is not initialized");
      return;
    }

    if (geoLocation && geoLayer) {
      console.info("Already tracking position. Ensuring it is visible.");
      view.setZoom(15);
      view.setCenter(geoLocation.getPosition());
      return;
    }

    const geolocation = new Geolocation();

    geolocation.setTracking(true);
    geolocation.on("error", (err: Error) => alert(err.message)); // Handle geolocation errors

    const accuracyFeature = new Feature();
    geolocation.on(
      "change:accuracyGeometry",
      () => accuracyFeature.setGeometry(geolocation.getAccuracyGeometry()),
    );

    const positionFeature = new Feature({
      style: new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({
            color: "#3399CC",
          }),
          stroke: new Stroke({
            color: "#fff",
            width: 2,
          }),
        }),
      }),
    });

    geolocation.on("change:position", () => {
      const coordinates = geolocation.getPosition();
      positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);

      if (view.getZoom() <= defaultZoom) {
        view.setZoom(15);
        view.setCenter(coordinates);
      }
    });

    const source = new VectorSource({
      features: [accuracyFeature, positionFeature],
    });
    const layer = new VectorLayer({ source, map });
    setGeoLocation(geolocation);
    setGeoLayer(layer);
  };

  return (
    <>
      <div id="map" class="w-full h-80 my-1" ref={mapDiv}></div>
      <button
        class="bg-gray-300 p-2 rounded-md border border-gray-700"
        onClick={trackPosition}
      >
        Vis min posisjon
      </button>
    </>
  );
}
