import { createAzureAdb2cOAuthConfig, createHelpers } from "@deno/kv-oauth";
import type { Context, Plugin } from "fresh";
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
      async handler(ctx: Context<Record<string, unknown>>) {
        return await signIn(ctx.req);
      },
    },
    {
      path: "/auth/callback",
      async handler(ctx: Context<Record<string, unknown>>) {
        const { response, sessionId, tokens } = await handleCallback(ctx.req);
        await storeAccessToken(sessionId, tokens);
        return response;
      },
    },
    {
      path: "/auth/signout",
      async handler(ctx: Context<Record<string, unknown>>) {
        return await signOut(ctx.req);
      },
    },
    {
      path: "/auth/protected",
      async handler(ctx: Context<Record<string, unknown>>) {
        return await getSessionId(ctx.req) === undefined
          ? new Response("Unauthorized", { status: 401 })
          : new Response("You are allowed");
      },
    },
  ],
} as Plugin;
