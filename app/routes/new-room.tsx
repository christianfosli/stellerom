import { Handlers, PageProps } from "$fresh/server.ts";
import { getSignedInUser } from "../utils/auth.ts";
import Header from "../utils/Header.tsx";

interface NewRoomData {
  isSignedIn: boolean;
  userName?: string;
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
  async GET(req, ctx) {
    const { isSignedIn, userName } = await getSignedInUser(req);

    const url = new URL(req.url);
    const lat = parseFloatOrUndefined(url.searchParams.get("lat"));
    const lng = parseFloatOrUndefined(url.searchParams.get("lng"));
    return ctx.render({
      isSignedIn,
      userName,
      method: "GET",
      get: { lat, lng },
      submit: null,
    });
  },
  async POST(req, ctx) {
    const { isSignedIn, userName } = await getSignedInUser(req);

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
        isSignedIn,
        userName,
        method: "POST",
        get: null,
        submit: "SUCCESS",
      });
    }

    console.error(`${res.status} ${res.statusText} error from room api`);

    const responseText = await res.text();

    return ctx.render({
      isSignedIn,
      userName,
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
      class="rounded shadow-md p-5 w-full"
    >
      <label class="block text-md font-bold" for="name">Navn</label>
      <input
        class="shadow border rounded w-full"
        type="text"
        name="name"
        id="name"
        required
      />
      <fieldset class="my-5">
        <legend class="block text-md font-bold">Posisjon</legend>
        <div class="flex items-center justify-between">
          <span>
            <label class="text-sm" for="lat">Latitude</label>
            <input
              class="shadow border rounded w-1/2"
              type="number"
              name="lat"
              id="lat"
              value={data.get?.lat}
              required
            />
          </span>
          <span>
            <label class="text-sm" for="lng">
              Longitude
            </label>
            <input
              class="shadow border rounded w-1/2"
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
        class="shadow bg-gray-300 text-md font-bold rounded p-2 w-full"
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
                    <a class="text-blue-700" href="/">tilbake hjem</a>{" "}
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
    <div class="p-4 mx-auto max-w-screen-md">
      <Header isSignedIn={data.isSignedIn} userName={data.userName} />
      <main>
        <h2 class="text-lg font-bold">Legg til nytt stellerom</h2>
        {renderMainContent()}
      </main>
    </div>
  );
}
