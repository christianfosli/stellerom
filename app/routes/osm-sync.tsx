import { Handlers, PageProps } from "$fresh/server.ts";
import { getSignedInUser } from "../utils/auth.ts";
import Header from "../utils/Header.tsx";

interface OsmSyncProps {
  isSignedIn: boolean;
  userName?: string;
}

export const handler: Handlers<OsmSyncProps> = {
  async GET(req, ctx) {
    const { isSignedIn, userName } = await getSignedInUser(req);
    return ctx.render({ isSignedIn, userName });
  },
};

export default function OsmSync({ data }: PageProps<OsmSyncProps>) {
  return (
    <div class="p-4 mx-auto max-w-screen-md">
      <Header isSignedIn={data.isSignedIn} userName={data.userName} />
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
}
