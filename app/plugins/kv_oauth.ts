import { createAzureAdb2cOAuthConfig, createHelpers } from "@deno/kv-oauth";
import type { Plugin } from "$fresh/server.ts";
import { storeAccessToken } from "../utils/auth.ts";

const oauthConfig = createAzureAdb2cOAuthConfig({
  redirectUri: `${
    Deno.env.get("APP_HOST") ?? "http://localhost:8000"
  }/auth/callback`,
  scope: ["openid", "profile", "email"],
});

const { signIn, handleCallback, signOut, getSessionId } = createHelpers(
  oauthConfig,
);

export { getSessionId };

export default {
  name: "kv-oauth",
  routes: [
    {
      path: "/auth/signin",
      async handler(req) {
        return await signIn(req);
      },
    },
    {
      path: "/auth/callback",
      async handler(req) {
        const { response, sessionId, tokens } = await handleCallback(req);
        await storeAccessToken(sessionId, tokens);
        return response;
      },
    },
    {
      path: "/auth/signout",
      async handler(req) {
        return await signOut(req);
      },
    },
    {
      path: "/auth/protected",
      async handler(req) {
        return await getSessionId(req) === undefined
          ? new Response("Unauthorized", { status: 401 })
          : new Response("You are allowed");
      },
    },
  ],
} as Plugin;
