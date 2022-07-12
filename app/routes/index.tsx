/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import Map from "../islands/Map.tsx";

export default function Home() {
  const googleMapsApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");

  return (
    <div class={tw`p-4 mx-auto max-w-screen-md`}>
      <header>
        <h1 class={tw`text-xl font-light`}>Stellerom.no</h1>
        <p>Finn og anmeld stellerom i nærheten</p>
      </header>
      <main>
        <Map apiKey={googleMapsApiKey} />
        <div class={tw`bg-red-300 my-4 p-2`}>
          <p>
            <b>Advarsel</b>: Utvikling har såvidt startet og siden er ikke enda
            funksjonell
          </p>
        </div>
      </main>
    </div>
  );
}
