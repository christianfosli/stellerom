import { App, staticFiles } from "fresh";
import kvoauth from "./plugins/kv_oauth.ts";
import AppWrapper from "./routes/_app.tsx";

export const app = new App()
  .use(staticFiles())
  .use(kvoauth)
  .fsRoutes()
  .appWrapper(AppWrapper);
