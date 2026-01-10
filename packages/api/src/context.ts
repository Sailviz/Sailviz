import { os } from "@orpc/server";
import { getSession } from "@sailviz/auth/client";

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
    const req = new Request("http://localhost", {
      headers: headers as HeadersInit,
    });
    const session = await getSession(req as unknown as Request);
    // runtime check: better-auth session typically contains a `user` object with `id`
    if (!(session && (session as any).user && (session as any).user.id)) {
      throw errors.UNAUTHORIZED();
    }

    return next({ context: { ...context, session } });
  });
