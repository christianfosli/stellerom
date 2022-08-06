/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h } from "preact";
import { tw } from "@twind";
import { Handlers, PageProps } from "$fresh/server.ts";
import { ChangingRoom, Review } from "../../utils/models.ts";
import EditRoom from "../../islands/EditRoom.tsx";
import Header from "../../utils/Header.tsx";

const roomApiUrl = Deno.env.get("ROOM_API_URL") ??
  "https://room-api-dev.stellerom.no";

const reviewApiUrl = Deno.env.get("REVIEW_API_URL") ??
  "https://review-api-dev.stellerom.no";

interface RoomData {
  room: ChangingRoom | { failureReason: string };
  reviews: Review[] | { failureReason: string };
}

export const handler: Handlers<RoomData> = {
  async GET(_req, ctx) {
    const { id } = ctx.params;
    const fetchRoom = fetch(`${roomApiUrl}/rooms/${id}`);
    const fetchReviews = fetch(`${reviewApiUrl}/reviews?roomId=${id}`);

    const roomRes = await fetchRoom;
    const room = roomRes.ok
      ? await roomRes.json()
      : { failureReason: await roomRes.text() };

    const reviewsRes = await fetchReviews;
    const reviews = reviewsRes.ok
      ? await reviewsRes.json()
      : { failureReason: await reviewsRes.text() };

    return ctx.render({ room, reviews });
  },
};

export default function Room(
  { data }: PageProps<RoomData>,
) {
  const { room, reviews } = data;

  if ("failureReason" in room) {
    return (
      <div class={tw`p-4 mx-auto max-w-screen-md`}>
        <Header />
        <main>
          <h2 class={tw`text-lg font-bold text-red-700`}>
            En uventet feil har oppstått 😬
          </h2>
          <p>
            {room.failureReason}
          </p>
        </main>
      </div>
    );
  }

  const renderReviews = () => {
    if ("failureReason" in reviews) {
      return (
        <>
          <h4 class={tw`text-md font-bold text-red-700`}>
            En uventet feil oppsto under henting av anmeldelser 😬
          </h4>
          <p>
            {reviews.failureReason}
          </p>
        </>
      );
    }
    return (
      <ul class={tw`list-none py-2`}>
        {reviews.map((r) => {
          return (
            <li class={tw`bg-green-200 p-2 rounded-md my-2`}>
              <p class={tw`text-sm font-bold`}>
                {new Date(r.reviewedAt).toLocaleString()} av{" "}
                {r.reviewedBy ?? "Anonym bruker"}
              </p>
              <p>Tilgjengelighet {r.availabilityRating}/5</p>
              <p>Sikkerhet {r.safetyRating}/5</p>
              <p>Renslighet {r.cleanlinessRating}/5</p>
              <h4 class={tw`text-sm font-bold`}>Kommentar</h4>
              {r.review ?? "-"}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div class={tw`p-4 mx-auto max-w-screen-md`}>
      <Header />
      <main>
        <h2 class={tw`text-lg font-bold`}>{room.name}</h2>
        <ul class={tw`list-none py-2 text-md`}>
          <li>Tilgjengelighet {room.ratings?.availability ?? "?"}/5</li>
          <li>Sikkerhet {room.ratings?.safety ?? "?"}/5</li>
          <li>Renslighet {room.ratings?.cleanliness ?? "?"}/5</li>
        </ul>
        <h3 class={tw`text-md font-bold`}>Anmeldelser</h3>
        <a href={`/new-review?roomId=${room.id}&roomName=${room.name}`}>
          <button class={tw`bg-gray-300 p-2 rounded-md border border-gray-700`}>
            Anmeld stellerom
          </button>
        </a>
        {renderReviews()}
        <h3 class={tw`text-md font-bold`}>Administrer stellerom</h3>
        <EditRoom room={room} apiUrl={roomApiUrl} />
      </main>
    </div>
  );
}
