import { PageProps } from "fresh";
import { getSignedInUser } from "../utils/auth.ts";
import Header from "../utils/Header.tsx";
import { Handlers } from "fresh/compat";

interface ProfileProps {
  isSignedIn: boolean;
  userName?: string;
}

export const handler: Handlers<ProfileProps> = {
  async GET(ctx) {
    const req = ctx.req;
    const { isSignedIn, userName } = await getSignedInUser(req);
    return ctx.render({ isSignedIn, userName });
  },
};

export default function Profile({ data }: PageProps<ProfileProps>) {
  return (
    <div class="p-4 mx-auto max-w-screen-md">
      <Header isSignedIn={data.isSignedIn} userName={data.userName} />
      <main>
        <h2 class="text-lg font-bold">
          Bruker {data.userName ?? "Ukjent?"}
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
}
