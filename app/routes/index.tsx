import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/src/runtime/head.ts";
import Map from "../islands/Map.tsx";
import Header from "../utils/Header.tsx";
import { ChangingRoom } from "../utils/models.ts";

const roomApiUrl = Deno.env.get("ROOM_API_URL") ??
  "https://room-api-dev.stellerom.no";

export const handler: Handlers<ChangingRoom[]> = {
  async GET(_, ctx) {
    const res = await fetch(`${roomApiUrl}/rooms`);
    if (!res.ok) {
      console.error(`Non-OK status code from room API: ${res.status}`);
      return ctx.render([]);
    }
    return ctx.render(await res.json());
  },
};

export default function Home({ data }: PageProps<ChangingRoom[]>) {
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <Header />
        <main>
          <Map changingRooms={data} />
        </main>
        <a class="text-blue-700" href="/about">Mer info</a>.
      </div>
    </>
  );
}
