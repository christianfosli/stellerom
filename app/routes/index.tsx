/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import Map from "../islands/Map.tsx";

export interface ChangingRoom {
  id: string;
  name: string | undefined | null;
  location: { lat: number; lng: number };
}

export default function Home() {
  const googleMapsApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY") ?? (() => {
    throw new Error("GOOGLE_MAPS_API_KEY was not set but is required");
  })();

  const mockChangingRooms = [{
    id: "abc123",
    name: "Mock stellerom",
    location: { lat: 60, lng: 10 },
  }, {
    id: "abc456",
    name: "Mock stellerom 2",
    location: { lat: 65, lng: 11 },
  }]; // TODO: Fetch from API

  return (
    <div class={tw`p-4 mx-auto max-w-screen-md`}>
      <header>
        <h1 class={tw`text-xl font-light`}>Stellerom.no</h1>
      </header>
      <main>
        <Map apiKey={googleMapsApiKey} changingRooms={mockChangingRooms} />
      </main>
      <aside class={tw`bg-red-300 my-4 p-2`}>
        <p>
          <b>Advarsel</b>: Utvikling har såvidt startet og siden er ikke enda
          funksjonell
        </p>
      </aside>
      <a class={tw`text-blue-700`} href="/about">Mer info</a>.
    </div>
  );
}
