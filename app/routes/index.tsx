import { Handlers, PageProps } from "$fresh/server.ts";
import Map from "../islands/Map.tsx";
import Header from "../utils/Header.tsx";
import { FeatureCollection } from "geojson";
import { getSignedInUser } from "../utils/auth.ts";

const roomApiUrl = Deno.env.get("ROOM_API_URL") ??
  "https://room-api-dev.stellerom.no";

interface HomeProps {
  isSignedIn: boolean;
  userName?: string;
  changingRooms: FeatureCollection[];
}

export const handler: Handlers<HomeProps> = {
  async GET(req, ctx) {
    const { isSignedIn, userName } = await getSignedInUser(req);

    const res = await fetch(`${roomApiUrl}/rooms-v2`);
    if (!res.ok) {
      console.error(`Non-OK status code from room API: ${res.status}`);
      return ctx.render({ isSignedIn, userName, changingRooms: [] });
    }
    return ctx.render({
      isSignedIn,
      userName,
      changingRooms: await res.json(),
    });
  },
};

export default function Home({ data }: PageProps<HomeProps>) {
  return (
    <div class="p-4 mx-auto max-w-screen-md">
      <Header isSignedIn={data.isSignedIn} userName={data.userName} />
      <main>
        <Map changingRooms={data.changingRooms} />
      </main>
      <a class="text-blue-700" href="/about">Mer info</a>.
    </div>
  );
}
