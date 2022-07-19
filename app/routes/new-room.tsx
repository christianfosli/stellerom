/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h } from "preact";
import { tw } from "@twind";
import { Handlers, PageProps } from "$fresh/server.ts";

interface NewRoomData {
  method: "GET" | "POST";
  get: { lat: number | undefined; lng: number | undefined } | null;
  submit: "SUCCESS" | { failureReason: string } | null;
}

function parseIntOrUndefined(x: string | undefined | null) {
  if (x) {
    const parsed = parseInt(x);
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
    const lat = parseIntOrUndefined(url.searchParams.get("lat"));
    const lng = parseIntOrUndefined(url.searchParams.get("lng"));
    return ctx.render({ method: "GET", get: { lat, lng }, submit: null });
  },
  POST(req, ctx) {
    //TODO: post to API
    return ctx.render({
      method: "POST",
      get: null,
      submit: { failureReason: "This functionality is not yet implemented" },
    });
  },
};

export default function NewRoom({ data }: PageProps<NewRoomData>) {
  const renderMainContent = () => {
    switch (data.method) {
      case "GET": {
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
              class={tw
                `shadow bg-gray-300 text-md font-bold rounded p-2 w-full`}
              type="submit"
            >
              Opprett
            </button>
          </form>
        );
      }
      case "POST": {
        return (
          <div>
            {data.submit == "SUCCESS" && (
                  <p>
                    Stellerommet ble lagt til! Gå <a href="/">tilbake hjem</a>
                    {" "}
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
                </>
              )}
          </div>
        );
      }
    }
  };

  return (
    <div class={tw`p-4 mx-auto max-w-screen-md`}>
      <header>
        <a href="/">
          <h1 class={tw`text-xl font-light`}>Stellerom.no</h1>
        </a>
      </header>
      <main>
        <h2 class={tw`text-lg font-bold`}>Legg til nytt stellerom</h2>
        {renderMainContent()}
      </main>
    </div>
  );
}
