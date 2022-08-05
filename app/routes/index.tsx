/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import { Handlers, PageProps } from "$fresh/server.ts";
import Map from "../islands/Map.tsx";
import Header from "../utils/Header.tsx";

const googleMapsApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY") ?? (() => {
  throw new Error("GOOGLE_MAPS_API_KEY was not set but is required");
})();

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
    <div class={tw`p-4 mx-auto max-w-screen-md`}>
      <Header />
      <main>
        <Map apiKey={googleMapsApiKey} changingRooms={data} />
      </main>
      <a class={tw`text-blue-700`} href="/about">Mer info</a>.
    </div>
  );
}
