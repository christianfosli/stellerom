import { Handlers, PageProps } from "$fresh/server.ts";
import Map from "../islands/Map.tsx";
import Header from "../utils/Header.tsx";
import { FeatureCollection } from "geojson";

const googleMapsApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY") ?? (() => {
  throw new Error("GOOGLE_MAPS_API_KEY was not set but is required");
})();

const roomApiUrl = Deno.env.get("ROOM_API_URL") ??
  "https://room-api-dev.stellerom.no";

export const handler: Handlers<FeatureCollection> = {
  async GET(_, ctx) {
    const res = await fetch(`${roomApiUrl}/rooms-v2`);
    if (!res.ok) {
      console.error(`Non-OK status code from room API: ${res.status}`);
      return ctx.render([]);
    }
    return ctx.render(await res.json());
  },
};

export default function Home({ data }: PageProps<FeatureCollection[]>) {
  return (
    <div class="p-4 mx-auto max-w-screen-md">
      <Header />
      <main>
        <Map apiKey={googleMapsApiKey} changingRooms={data} />
      </main>
      <a class="text-blue-700" href="/about">Mer info</a>.
    </div>
  );
}
