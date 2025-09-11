import { createAzureAdb2cOAuthConfig, createHelpers } from "@deno/kv-oauth";
import { getSignedInUser, storeAccessToken } from "../utils/auth.ts";
import { define } from "../utils/fresh.ts";

const oauthConfig = createAzureAdb2cOAuthConfig({
  redirectUri: `${
    Deno.env.get("APP_HOST") ?? "http://localhost:5173"
  }/auth/callback`,
  scope: ["openid", "profile", "email"],
});

const { signIn, handleCallback, signOut, getSessionId } = createHelpers(
  oauthConfig,
);

export { getSessionId };

const kvOauth = define.middleware(async (ctx) => {
  const path = new URL(ctx.req.url).pathname;
  switch (path) {
    case "/auth/signin":
      return await signIn(ctx.req);
    case "/auth/callback": {
      const { response, sessionId, tokens } = await handleCallback(ctx.req);
      await storeAccessToken(sessionId, tokens);
      return response;
    }
    case "/auth/signout":
      return await signOut(ctx.req);
    default:
      if (await getSessionId(ctx.req) === undefined) {
        ctx.state.isSignedIn = false;
        ctx.state.userName = null;
      } else {
        ctx.state.isSignedIn = true;

        const { userName } = await getSignedInUser(ctx.req);
        ctx.state.userName = userName;
      }

      return await ctx.next();
  }
});

export default kvOauth;
