// DO NOT EDIT. This file is generated by fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import config from "./deno.json" assert { type: "json" };
import * as $0 from "./routes/about.tsx";
import * as $1 from "./routes/index.tsx";
import * as $2 from "./routes/new-review.tsx";
import * as $3 from "./routes/new-room.tsx";
import * as $4 from "./routes/rooms/[id].tsx";
import * as $$0 from "./islands/EditRoom.tsx";
import * as $$1 from "./islands/Map.tsx";
import * as $$2 from "./islands/RangeInput.tsx";

const manifest = {
  routes: {
    "./routes/about.tsx": $0,
    "./routes/index.tsx": $1,
    "./routes/new-review.tsx": $2,
    "./routes/new-room.tsx": $3,
    "./routes/rooms/[id].tsx": $4,
  },
  islands: {
    "./islands/EditRoom.tsx": $$0,
    "./islands/Map.tsx": $$1,
    "./islands/RangeInput.tsx": $$2,
  },
  baseUrl: import.meta.url,
  config,
};

export default manifest;
