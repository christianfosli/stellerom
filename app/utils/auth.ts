/// <reference lib="deno.unstable" />
import type { Tokens } from "@deno/kv-oauth";
import { decode } from "@wok/djwt";
import { getSessionId } from "../plugins/kv_oauth.ts";

const kv = await Deno.openKv();

export async function storeAccessToken(
  sessionId: string,
  tokens: Tokens,
): Promise<void> {
  if (!tokens.accessToken) {
    console.warn("No access token to store.. Nothing to do.");
  }
  await kv.set(["access_tokens", sessionId], tokens.accessToken, {
    expireIn: tokens.expiresIn,
  });
}

export async function getAccessToken(
  sessionId: string,
): Promise<string | null> {
  return (await kv.get<string>(["access_tokens", sessionId])).value;
}

interface User {
  isSignedIn: boolean;
  userName?: string;
  accessToken?: string | null;
}

export async function getSignedInUser(req: Request): Promise<User> {
  const sessionId = await getSessionId(req);
  const isSignedIn = !!sessionId;

  if (!isSignedIn) {
    return { isSignedIn };
  }

  const accessToken = await getAccessToken(sessionId);
  let userName = undefined;

  if (accessToken) {
    // deno-lint-ignore no-explicit-any
    const [_, tokenPayload] = decode<any>(accessToken);
    userName = tokenPayload.name;
  }

  return { isSignedIn, userName, accessToken };
}
