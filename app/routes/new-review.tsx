/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h } from "preact";
import { tw } from "@twind";
import { Handlers, PageProps } from "$fresh/server.ts";
import Header from "../utils/Header.tsx";
import RangeInput from "../islands/RangeInput.tsx";

interface NewReviewData {
  formData: {
    roomId?: string;
    roomName?: string;
    availabilityRating?: number;
    safetyRating?: number;
    cleanlinessRating?: number;
    review?: string;
    reviewedBy?: string;
  };
  submitError: { failureReason: string } | null;
}

const reviewApiUrl = Deno.env.get("REVIEW_API_URL") ??
  "https://room-api-dev.stellerom.no";

export const handler: Handlers<NewReviewData> = {
  GET(req, ctx) {
    const url = new URL(req.url);
    const roomId = url.searchParams.get("roomId") as (string | undefined);
    const roomName = url.searchParams.get("roomName") as (string | undefined);
    return ctx.render({
      formData: { roomId, roomName },
      submitError: null,
    });
  },
  async POST(req, ctx) {
    const formData = await req.formData();
    const roomId = formData.get("roomId")?.valueOf() as string;
    const roomName = formData.get("roomName")?.valueOf() as string;
    const availabilityRating = parseInt(
      formData.get("availabilityRating")
        ?.valueOf() as string,
      10,
    );
    const safetyRating = parseInt(
      formData.get("safetyRating")?.valueOf() as string,
      10,
    );
    const cleanlinessRating = parseInt(
      formData.get("cleanlinessRating")
        ?.valueOf() as string,
      10,
    );
    let review = formData.get("review")?.valueOf() as
      | string
      | undefined;
    if (review === "") {
      review = undefined;
    }

    let reviewedBy = formData.get("reviewedBy")?.valueOf() as
      | string
      | undefined;
    if (reviewedBy === "") {
      reviewedBy = undefined;
    }

    const res = await fetch(`${reviewApiUrl}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId,
        availabilityRating,
        safetyRating,
        cleanlinessRating,
        review,
        reviewedBy,
      }),
    });

    if (res.ok) {
      console.info("Review created successfully. Redirecting to room");
      const headers = new Headers({
        location: `${new URL(req.url).origin}/rooms/${roomId}`,
      });
      return new Response(null, {
        status: 302,
        headers,
      });
    }

    console.error(`${res.status} ${res.statusText} error from review api`);

    const responseText = await res.text();

    return ctx.render({
      formData: {
        roomId,
        roomName,
        availabilityRating,
        safetyRating,
        cleanlinessRating,
        review,
        reviewedBy,
      },
      submitError: { failureReason: responseText },
    });
  },
};

function renderForm(data: NewReviewData) {
  return (
    <form
      method="POST"
      class={tw`rounded shadow-md p-5`}
    >
      <fieldset class={tw`my-5`}>
        <legend class={tw`block text-md font-bold`}>Stellerom</legend>
        <div class={tw`w-full flex flex-row justify-between`}>
          <input
            class={tw`shadow border rounded w-5/4`}
            type="text"
            name="roomId"
            id="roomId"
            value={data.formData?.roomId}
            required
          />
          <label class={tw`text-sm`} for="roomId">
            {data.formData?.roomName}
          </label>
          <input
            class={tw`shadow border rounded`}
            type="hidden"
            name="roomName"
            id="roomName"
            value={data.formData?.roomName}
          />
        </div>
      </fieldset>
      <RangeInput
        label="Tilgjengelighet"
        min={1}
        max={5}
        startValue={3}
        name="availabilityRating"
        required={true}
      />
      <RangeInput
        label="Sikkerhet"
        min={1}
        max={5}
        startValue={3}
        name="safetyRating"
        required={true}
      />
      <RangeInput
        label="Renglishet"
        min={1}
        max={5}
        startValue={3}
        name="cleanlinessRating"
        required={true}
      />

      <label class={tw`block text-md font-bold mt-3`} for="reviewText">
        Kommentarer (frivillig)
      </label>
      <textarea
        class={tw`shadow border rounded w-full mb-3`}
        name="review"
        id="reviewText"
        rows={3}
      />
      <label class={tw`block text-md font-bold`} for="reviewedBy">
        Ditt navn (frivillig)
      </label>
      <input
        class={tw`shadow border rounded w-full mb-3`}
        type="text"
        name="reviewedBy"
        id="reviewedBy"
        title="Skriv gjerne inn ditt fornavn / kallenavn el. lignende"
      />

      <button
        class={tw`shadow bg-gray-300 text-md font-bold rounded p-2 w-full`}
        type="submit"
      >
        Opprett
      </button>
    </form>
  );
}

export default function NewRoom({ data }: PageProps<NewReviewData>) {
  return (
    <div class={tw`p-4 mx-auto max-w-screen-md`}>
      <Header />
      <main>
        <h2 class={tw`text-lg font-bold`}>
          Anmeld stellerom &quot;{data.formData.roomName}&quot;
        </h2>
        {data.submitError && (
              <div class={tw`bg-red-300 rounded p-2`}>
                <h3 class={tw`text-md font-bold`}>
                  Vi beklager, en feil har oppstått.
                </h3>
                <p>
                  {data.submitError?.failureReason}
                </p>
              </div>
            ) || <></>}
        {renderForm(data)}
      </main>
    </div>
  );
}
