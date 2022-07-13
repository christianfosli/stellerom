/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import Map from "../islands/Map.tsx";

export default function About() {
  return (
    <div class={tw`p-4 mx-auto max-w-screen-md`}>
      <header>
        <h1 class={tw`text-xl font-light`}>Stellerom.no</h1>
      </header>
      <main>
        <p>
          Stellerom.no er en nettside hvor man skal kunne legge til, anmelde og
          søke opp offentlige stellerom i Norge.
        </p>
      </main>
    </div>
  );
}
