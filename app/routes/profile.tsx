import Header from "../utils/Header.tsx";
import { define } from "../utils/fresh.ts";

export default define.page(function Profile(ctx) {
  return (
    <div class="p-4 mx-auto max-w-screen-md">
      <Header isSignedIn={ctx.state.isSignedIn} userName={ctx.state.userName} />
      <main>
        <h2 class="text-lg font-bold">
          Bruker {ctx.state.userName ?? "Ukjent?"}
        </h2>
        <p class="my-2">
          Her skal det bli mulig å redigere visningsnavn og slette brukeren din.
          Men jeg har ikke fått implementert det enda. Sjekk tilbake senere
          eller ta kontakt med{" "}
          <a class="underline" href="https://www.christianfosli.com">
            utvikleren min
          </a>.
        </p>
        <p class="my-2 text-xs">
          Note-2-utvikleren-min: Implementere redigere og slette bruker via MS
          Graph API.
        </p>
      </main>
    </div>
  );
});
