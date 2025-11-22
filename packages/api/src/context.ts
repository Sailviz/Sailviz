import { os } from "@orpc/server";
import { getSession, getSessionByToken } from "@sailviz/auth/client";

export const withSession = os
  .$context<{
    session?: any;
    headers?: Record<string, string | string[] | undefined>;
  }>()
  .errors({
    UNAUTHORIZED: { message: "Login required" },
  })
  .use(async ({ context, next, errors }) => {
    // Build a minimal Web Request using forwarded headers so the auth client
    // can read cookies/session info. The auth client expects a Web Request.
    const headers = context.headers ?? {};

    // Prefer token-based lookup when an Authorization header (or x-token) is
    // present. This allows desktop clients (Tauri) that attach a bearer token
    // to authenticate without relying on cookies.
    const authHeader = (headers["authorization"] ||
      headers["Authorization"]) as string | string[] | undefined;
    let token: string | null = null;
    try {
      if (authHeader) {
        const ah = Array.isArray(authHeader) ? authHeader[0] : authHeader;
        if (typeof ah === "string" && ah.startsWith("Bearer ")) {
          token = ah.slice(7);
        }
      }
      if (!token) {
        const xToken = headers["x-session-token"] || headers["x-token"];
        if (xToken)
          token = Array.isArray(xToken)
            ? (xToken[0] as string)
            : (xToken as string);
      }
    } catch (e) {
      token = null;
    }

    let session: any = null;
    try {
      if (token) {
        const res = await getSessionByToken(token);
        session = res && (res as any).data ? (res as any).data : res;
      } else {
        // For web (cookie-based) flows, call `getSession` with the
        // forwarded request headers as `fetchOptions` so the auth client
        // can read cookies and return the session.
        const res = await getSession({ headers: headers as HeadersInit });
        session = res && (res as any).data ? (res as any).data : res;
      }
    } catch (e) {
      throw errors.UNAUTHORIZED();
    }

    // runtime check: better-auth session typically contains a `user` object with `id`
    if (!(session && (session as any).user && (session as any).user.id)) {
      throw errors.UNAUTHORIZED();
    }

    return next({ context: { ...context, session } });
  });
