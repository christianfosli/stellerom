import Header from "../utils/Header.tsx";
import { define } from "../utils/fresh.ts";

export default define.page(function OsmSync(ctx) {
  return (
    <div class="p-4 mx-auto max-w-screen-md">
      <Header isSignedIn={ctx.state.isSignedIn} userName={ctx.state.userName} />
      <main>
        <h2 class="text-lg font-bold">Open Street Map</h2>
        <p class="mb-2">
          Data om stellerom i Norge hentes automatisk fra Open Street Map inn
          til stellerom.no daglig.
        </p>
        <p class="mb-2">
          Man legger inn stellerom i Open Street Map ved å legge til{" "}
          <code>changing_table=yes</code> på den "nærmeste node".
        </p>
        <p class="mb-2">
          Sjekk{" "}
          <a
            href="https://www.openstreetmap.org/help"
            class="underline text-blue-600"
          >
            OpenStreetMap sine sider
          </a>{" "}
          for mer info om hvordan oppdatere kartene deres.
        </p>
      </main>
    </div>
  );
});
