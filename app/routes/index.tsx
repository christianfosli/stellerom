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
    <div class="p-4 mx-auto max-w-screen-md">
      <Header />
      <div class="bg-red-900 p-2 text-white">
        <details>
          <summary>
            <h3 class="inline-block text-md font-bold">
              Driftsmeldinger og greit-å-vite
            </h3>
          </summary>
          <ul class="list-disc p-4">
            <li class="my-2">
              Jeg har tenkt å skrive om siden til å hente posisjonsdata om
              stellerom fra
              <a href="https://www.openstreetmap.org/">Open Street Map</a>. Det
              tar en stund siden jeg har prioritert andre ting enn denne
              nettsiden, men det kan være lurt å legge inn nye og manglende
              stellerom der 😊.
            </li>
            <li class="my-2">
              Den 1 Februar bytter jeg jobb, og jeg vil i den anledning gjøre
              litt endringer på Azure infrastuktur som brukes for å hoste
              backend API'ene for denne nettsiden. Det betyr sannsynligvis ett
              par dager hvor nettsiden ikke fungerer som forventet.
            </li>
          </ul>
        </details>
      </div>
      <main>
        <Map apiKey={googleMapsApiKey} changingRooms={data} />
      </main>
      <a class="text-blue-700" href="/about">Mer info</a>.
    </div>
  );
}
