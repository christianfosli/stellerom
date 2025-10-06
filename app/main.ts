import { App, staticFiles } from "fresh";
import kvoauth from "./middlewares/kv_oauth.ts";
import { State } from "./utils/fresh.ts";

export const app = new App<State>();

app
  .use(staticFiles())
  .use(kvoauth)
  .fsRoutes();
