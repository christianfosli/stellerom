/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import { ChangingRoom } from "../utils/models.ts";

interface EditRoomProps {
  room: ChangingRoom;
  apiUrl: string;
}

export default function EditRoom(props: EditRoomProps) {
  const handleChangeName = async () => {
    const new_name = prompt("Skriv inn nytt navn");
    if (!new_name) {
      console.info("Change name aborted");
      return;
    }

    const res = await fetch(`${props.apiUrl}/rooms/${props.room.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...props.room,
        name: new_name,
      }),
    });

    if (res.ok) {
      console.info("Update successful. Refreshing page.");
      location.reload();
    } else {
      console.error(`${res.status} ${res.statusText} response from api`);
      const resText = await res.text();
      const error = resText ? resText : "Det oppstod en feil";
      alert(error);
    }
  };

  const handleDelete = async () => {
    if (confirm("Sikker?")) {
      const res = await fetch(`${props.apiUrl}/rooms/${props.room.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        console.info("Room deleted successfully. Redirecting home.");
        window.location.replace("/");
      } else {
        console.error(`${res.status} ${res.statusText} response from api`);
        const resText = await res.text();
        const error = resText ? resText : "Det oppstod en feil";
        alert(error);
      }
    } else {
      console.info("Delete room aborted");
    }
  };

  return (
    <div>
      <button
        class={tw`bg-gray-300 p-2 rounded-md border border-gray-700`}
        onClick={handleChangeName}
      >
        Endre navn
      </button>
      &nbsp;&nbsp;
      <button
        class={tw`bg-red-300 p-2 rounded-md border border-red-700`}
        onClick={handleDelete}
      >
        Slett stellerom
      </button>
    </div>
  );
}
