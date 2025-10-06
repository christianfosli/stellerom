import RoomsMap from "../islands/RoomsMap.tsx";
import Header from "../utils/Header.tsx";
import { FeatureCollection } from "geojson";
import { define } from "../utils/fresh.ts";

const roomApiUrl = Deno.env.get("ROOM_API_URL") ??
  "https://room-api-dev.stellerom.no";

async function getRooms(): FeatureCollection {
  const res = await fetch(`${roomApiUrl}/rooms-v2`);
  if (!res.ok) {
    console.error(`Non-OK status code from room API: ${res.status}`);
    return [];
  }
  return await res.json();
}

export default define.page(async function Home(ctx) {
  const rooms = await getRooms();
  return (
    <div class="p-4 mx-auto max-w-screen-md">
      <Header isSignedIn={ctx.state.isSignedIn} userName={ctx.state.userName} />
      <main>
        <RoomsMap changingRooms={rooms} />
      </main>
      <a class="text-blue-700" href="/about">Mer info</a>.
    </div>
  );
});
