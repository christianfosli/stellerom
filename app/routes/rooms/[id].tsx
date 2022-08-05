/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import { Handlers, PageProps } from "$fresh/server.ts";
import { ChangingRoom } from "../index.tsx";
import EditRoom from "../../islands/EditRoom.tsx";
import Header from "../../utils/Header.tsx";

const roomApiUrl = Deno.env.get("ROOM_API_URL") ??
  "https://room-api-dev.stellerom.no";

export const handler: Handlers<ChangingRoom | { failureReason: string }> = {
  async GET(_req, ctx) {
    const { id } = ctx.params;
    const res = await fetch(`${roomApiUrl}/rooms/${id}`);
    if (!res.ok) {
      console.error(`${res.status} ${res.statusText} error from room api`);
      const responseText = await res.text();
      return ctx.render({ failureReason: responseText });
    }
    return ctx.render(await res.json());
  },
};

export default function Room(
  { data }: PageProps<ChangingRoom | { failureReason: string }>,
) {
  if ("failureReason" in data) {
    return (
      <div class={tw`p-4 mx-auto max-w-screen-md`}>
        <Header />
        <main>
          <h2 class={tw`text-lg font-bold text-red-700`}>
            En uventet feil har oppstått 😬
          </h2>
          <p>
            {data.failureReason}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div class={tw`p-4 mx-auto max-w-screen-md`}>
      <Header />
      <main>
        <h2 class={tw`text-lg font-bold`}>{data.name}</h2>
        <ul class={tw`list-none py-2 text-md`}>
          <li>Tilgjengelighet {data.ratings?.availability ?? "?"}/5</li>
          <li>Sikkerhet {data.ratings?.safety ?? "?"}/5</li>
          <li>Renslighet {data.ratings?.cleanliness ?? "?"}/5</li>
        </ul>
        <h3 class={tw`text-md font-bold`}>Anmeldelser</h3>
        <p>
          Her skal man kunne se over anmeldelser, og anmelde rommet selv. Meeen
          det er ikke implementert helt enda.
        </p>
        <h3 class={tw`text-md font-bold`}>Administrer rom</h3>
        <EditRoom room={data} apiUrl={roomApiUrl} />
      </main>
    </div>
  );
}
