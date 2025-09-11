import { PageProps } from "fresh";
import Map from "../islands/Map.tsx";
import Header from "../utils/Header.tsx";
import { FeatureCollection } from "geojson";
import { getSignedInUser } from "../utils/auth.ts";
import { define } from "../utils/fresh.ts";

const roomApiUrl = Deno.env.get("ROOM_API_URL") ??
  "https://room-api-dev.stellerom.no";

interface HomeProps {
  isSignedIn: boolean;
  userName?: string;
  changingRooms: FeatureCollection[];
}

export const handler = define.handlers<HomeProps>({
  async GET(ctx) {
    const { isSignedIn, userName } = await getSignedInUser(ctx.req);

    const res = await fetch(`${roomApiUrl}/rooms-v2`);
    if (!res.ok) {
      console.error(`Non-OK status code from room API: ${res.status}`);
      return { data: { isSignedIn, userName, changingRooms: [] } };
    }
    return {
      data: {
        isSignedIn,
        userName,
        changingRooms: await res.json(),
      },
    };
  },
});

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
