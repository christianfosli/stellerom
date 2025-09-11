import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";
import kv_oauth from "./plugins/kv_oauth.ts";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    fresh(),
    tailwindcss(),
    kv_oauth,
  ],
});
