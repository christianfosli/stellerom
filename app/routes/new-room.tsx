/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h } from "preact";
import { tw } from "@twind";
import { Handlers, PageProps } from "$fresh/server.ts";
import Header from "../utils/Header.tsx";

interface NewRoomData {
  method: "GET" | "POST";
  get: { lat: number | undefined; lng: number | undefined } | null;
  submit: "SUCCESS" | { failureReason: string } | null;
}

const roomApiUrl = Deno.env.get("ROOM_API_URL") ??
  "https://room-api-dev.stellerom.no";

function parseFloatOrUndefined(x: string | undefined | null) {
  if (x) {
    const parsed = parseFloat(x);
    if (isNaN(parsed)) {
      return undefined;
    }
    return parsed;
  }
  return undefined;
}

export const handler: Handlers<NewRoomData> = {
  GET(req, ctx) {
    const url = new URL(req.url);
    const lat = parseFloatOrUndefined(url.searchParams.get("lat"));
    const lng = parseFloatOrUndefined(url.searchParams.get("lng"));
    return ctx.render({ method: "GET", get: { lat, lng }, submit: null });
  },
  async POST(req, ctx) {
    const formData = await req.formData();
    const lat = parseFloat(formData.get("lat")?.valueOf() as string);
    const lng = parseFloat(formData.get("lng")?.valueOf() as string);
    const res = await fetch(`${roomApiUrl}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.get("name"),
        location: { lat, lng },
      }),
    });

    if (res.ok) {
      return ctx.render({
        method: "POST",
        get: null,
        submit: "SUCCESS",
      });
    }

    console.error(`${res.status} ${res.statusText} error from room api`);

    const responseText = await res.text();

    return ctx.render({
      method: "POST",
      get: { lat, lng },
      submit: { failureReason: responseText },
    });
  },
};

function renderForm(data: NewRoomData) {
  return (
    <form
      method="POST"
      class={tw`rounded shadow-md p-5`}
    >
      <label class={tw`block text-md font-bold`} for="name">Navn</label>
      <input
        class={tw`shadow border rounded w-full`}
        type="text"
        name="name"
        id="name"
        required
      />
      <fieldset class={tw`my-5`}>
        <legend class={tw`block text-md font-bold`}>Posisjon</legend>
        <div class={tw`flex items-center justify-between`}>
          <span>
            <label class={tw`text-sm`} for="lat">Latitude</label>
            <input
              class={tw`shadow border rounded w-1/2`}
              type="number"
              name="lat"
              id="lat"
              value={data.get?.lat}
              required
            />
          </span>
          <span>
            <label class={tw`text-sm`} for="lng">
              Longitude
            </label>
            <input
              class={tw`shadow border rounded w-1/2`}
              type="number"
              name="lng"
              id="lng"
              value={data.get?.lng}
              required
            />
          </span>
        </div>
      </fieldset>
      <button
        class={tw`shadow bg-gray-300 text-md font-bold rounded p-2 w-full`}
        type="submit"
      >
        Opprett
      </button>
    </form>
  );
}

export default function NewRoom({ data }: PageProps<NewRoomData>) {
  const renderMainContent = () => {
    switch (data.method) {
      case "GET": {
        return renderForm(data);
      }
      case "POST": {
        return (
          <div>
            {data.submit == "SUCCESS" && (
                  <p>
                    Stellerommet ble lagt til! Gå{" "}
                    <a class={tw`text-blue-700`} href="/">tilbake hjem</a>{" "}
                    å se den på kartet.
                  </p>
                ) ||
              (
                <>
                  <h3>
                    Vi beklager, en feil har oppstått.
                  </h3>
                  <pre>
                    {JSON.stringify(data.submit)}
                  </pre>
                  {renderForm(data)}
                </>
              )}
          </div>
        );
      }
    }
  };

  return (
    <div class={tw`p-4 mx-auto max-w-screen-md`}>
      <Header />
      <main>
        <h2 class={tw`text-lg font-bold`}>Legg til nytt stellerom</h2>
        {renderMainContent()}
      </main>
    </div>
  );
}
