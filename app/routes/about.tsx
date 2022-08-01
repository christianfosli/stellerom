/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import Header from "../utils/Header.tsx";

export default function About() {
  return (
    <div class={tw`p-4 mx-auto max-w-screen-md`}>
      <Header />
      <main>
        <h2 class={tw`text-lg font-bold`}>Om oss</h2>
        <p class={tw`mb-2`}>
          Stellerom.no er en nettside hvor man skal kunne legge til, anmelde og
          søke opp offentlige stellerom i Norge.
        </p>
        <p class={tw`mb-2`}>
          Foreløpig mangler en del av basisfunksjonaliteten, men sjekk gjerne
          tilbake senere.
        </p>
        <h2 class={tw`text-lg font-bold`}>
          Teknologi, feil og forbedringsforslag
        </h2>
        <p class={tw`mb-2`}>
          Nettsidens kildekode ligger åpent på{" "}
          <a
            class={tw`text-blue-700`}
            href="https://github.com/christianfosli/stellerom"
          >
            GitHub
          </a>. Feil, mangler og forbedringforslag kan også meldes inn her, via
          GitHub issues.
        </p>
      </main>
    </div>
  );
}
