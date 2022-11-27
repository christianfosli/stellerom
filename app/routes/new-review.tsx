import { Handlers, PageProps } from "$fresh/server.ts";
import Header from "../utils/Header.tsx";
import RangeInput from "../islands/RangeInput.tsx";
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";

interface NewReviewData {
  formData: {
    roomId?: string;
    roomName?: string;
    availabilityRating?: number;
    safetyRating?: number;
    cleanlinessRating?: number;
    review?: string;
    roomImage?: File;
    reviewedBy?: string;
  };
  submitError: { failureReason: string } | null;
}

const reviewApiUrl = Deno.env.get("REVIEW_API_URL") ??
  "https://review-api-dev.stellerom.no";

const blobStoreAccount = Deno.env.get("BLOB_STORE_ACCOUNT") ??
  "https://ststelleromdev.blob.core.windows.net";

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

    const roomImage = formData.get("roomImage") as File | null;
    let imageUrl = null;
    if (roomImage) {
      console.info(
        `Review includes room image. Preparing upload to ${blobStoreAccount}`,
      );
      const credential = new DefaultAzureCredential();
      const blobClient = new BlobServiceClient(blobStoreAccount, credential);
      const containerClient = blobClient.getContainerClient(`room-${roomId}`);
      await containerClient.createIfNotExists();
      await containerClient.uploadBlockBlob(
        roomImage.name,
        roomImage.stream(),
        roomImage.size,
      );
      imageUrl = `${containerClient.url}/${roomImage.name}`;
      console.info(`Uploaded image to ${imageUrl}.`);
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
        imageUrl,
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
      class="rounded shadow-md p-5"
    >
      <fieldset class="my-5">
        <legend class="block text-md font-bold">Stellerom</legend>
        <div class="w-full flex flex-row justify-between">
          <input
            class="shadow border rounded w-5/4"
            type="text"
            name="roomId"
            id="roomId"
            value={data.formData?.roomId}
            required
          />
          <label class="text-sm" for="roomId">
            {data.formData?.roomName}
          </label>
          <input
            class="shadow border rounded"
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

      <label class="block text-md font-bold mt-3" for="reviewText">
        Kommentarer (frivillig)
      </label>
      <textarea
        class="shadow border rounded w-full mb-3"
        name="review"
        id="reviewText"
        rows={3}
      />
      <label class="block text-md font-bold" for="roomImage">
        Last opp bilder (frivillig)
      </label>
      <input
        type="file"
        id="roomImage"
        name="roomImage"
        accept="image/*"
        capture="environment"
        multiple={false}
      />

      <label class="block text-md font-bold" for="reviewedBy">
        Ditt navn (frivillig)
      </label>
      <input
        class="shadow border rounded w-full mb-3"
        type="text"
        name="reviewedBy"
        id="reviewedBy"
        title="Skriv gjerne inn ditt fornavn / kallenavn el. lignende"
      />

      <button
        class="shadow bg-gray-300 text-md font-bold rounded p-2 w-full"
        type="submit"
      >
        Opprett
      </button>
    </form>
  );
}

export default function NewRoom({ data }: PageProps<NewReviewData>) {
  return (
    <div class="p-4 mx-auto max-w-screen-md">
      <Header />
      <main>
        <h2 class="text-lg font-bold">
          Anmeld stellerom &quot;{data.formData.roomName}&quot;
        </h2>
        {data.submitError && (
              <div class="bg-red-300 rounded p-2">
                <h3 class="text-md font-bold">
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
