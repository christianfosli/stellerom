/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";

export default function About() {
  return (
    <div class={tw`p-4 mx-auto max-w-screen-md`}>
      <header>
        <a href="/">
          <h1 class={tw`text-xl font-light`}>Stellerom.no</h1>
        </a>
      </header>
      <main>
        <h2 class={tw`text-lg font-bold`}>Om oss</h2>
        <p>
          Stellerom.no er en nettside hvor man skal kunne legge til, anmelde og
          søke opp offentlige stellerom i Norge.
        </p>
        <p>
          Foreløpig mangler basisfunksjonaliteten, men sjekk gjerne tilbake
          senere.
        </p>
        <h2 class={tw`text-lg font-bold`}>Teknologi og feil</h2>
        <p>
          Nettsidens kildekode ligger åpent på{" "}
          <a
            class={tw`text-blue-700`}
            href="https://github.com/christianfosli/stellerom"
          >
            GitHub
          </a>. Feil og mangler kan også meldes inn her, via GitHub issues.
        </p>
      </main>
    </div>
  );
}
