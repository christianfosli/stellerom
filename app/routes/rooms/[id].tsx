import { Handlers, PageProps } from "$fresh/server.ts";
import { ChangingRoom, Review } from "../../utils/models.ts";
import EditRoom from "../../islands/EditRoom.tsx";
import { getSignedInUser } from "../../utils/auth.ts";
import Header from "../../utils/Header.tsx";
import { SimpleMap } from "../../islands/SimpleMap.tsx";

const roomApiUrl = Deno.env.get("ROOM_API_URL") ??
  "https://room-api-dev.stellerom.no";

const reviewApiUrl = Deno.env.get("REVIEW_API_URL") ??
  "https://review-api-dev.stellerom.no";

interface RoomData {
  isSignedIn: bool;
  userName?: string;
  room: ChangingRoom | { failureReason: string };
  reviews: Review[] | { failureReason: string };
}

export const handler: Handlers<RoomData> = {
  async GET(req, ctx) {
    const { isSignedIn, userName } = await getSignedInUser(req);

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

    return ctx.render({ isSignedIn, userName, room, reviews });
  },
};

export default function Room(
  { data }: PageProps<RoomData>,
) {
  const { room, reviews } = data;

  if ("failureReason" in room) {
    return (
      <div class="p-4 mx-auto max-w-screen-md">
        <Header isSignedIn={data.isSignedIn} userName={data.userName} />
        <main>
          <h2 class="text-lg font-bold text-red-700">
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
          <h4 class="text-md font-bold text-red-700">
            En uventet feil oppsto under henting av anmeldelser 😬
          </h4>
          <p>
            {reviews.failureReason}
          </p>
        </>
      );
    }
    return (
      <ul class="list-none py-2">
        {reviews.map((r) => {
          return (
            <li class="bg-green-200 p-2 rounded-md my-2">
              <p class="text-sm font-bold">
                {new Date(r.reviewedAt).toLocaleString()} av{" "}
                {r.reviewedBy ?? "Anonym bruker"}
              </p>
              <p>Tilgjengelighet {r.availabilityRating}/5</p>
              <p>Sikkerhet {r.safetyRating}/5</p>
              <p>Renslighet {r.cleanlinessRating}/5</p>
              <h4 class="text-sm font-bold">Kommentar</h4>
              {r.review ?? "-"}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div class="p-4 mx-auto max-w-screen-md">
      <Header isSignedIn={data.isSignedIn} userName={data.userName} />
      <main>
        <h1 class="text-2xl font-bold">{room.name}</h1>
        <SimpleMap lat={room.location.lat} lng={room.location.lng} />
        <ul class="list-none py-2 text-md">
          <li>Tilgjengelighet {room.ratings?.availability ?? "?"}/5</li>
          <li>Sikkerhet {room.ratings?.safety ?? "?"}/5</li>
          <li>Renslighet {room.ratings?.cleanliness ?? "?"}/5</li>
        </ul>
        <h3 class="text-md font-bold">Anmeldelser</h3>
        <a href={`/new-review?roomId=${room.id}&roomName=${room.name}`}>
          <button
            type="button"
            class="bg-gray-300 p-2 rounded-md border border-gray-700"
          >
            Anmeld stellerom
          </button>
        </a>
        {renderReviews()}
        <h3 class="text-md font-bold">Administrer stellerom</h3>
        <EditRoom room={room} apiUrl={roomApiUrl} />
      </main>
    </div>
  );
}
