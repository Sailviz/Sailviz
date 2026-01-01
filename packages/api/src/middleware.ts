import { ORPCError } from "@orpc/server";
import { implement } from "@orpc/server";
import { ORPCcontract } from "./contract";
import prisma from "@sailviz/db";
import { RequestHeadersPluginContext } from "@orpc/server/plugins";
import { auth } from "@sailviz/auth/auth";
const os = implement(ORPCcontract);

interface ORPCContext extends RequestHeadersPluginContext {
  req: Request;
}
export const authMiddleware = os
  .$context<ORPCContext>()
  .middleware(async ({ context, next }) => {
    // If a bearer token or x-session-token/x-token is present, resolve the
    // session directly from the database. This supports desktop clients
    // (Tauri) that send a token instead of cookies.
    const rawHeaders = context.reqHeaders as unknown;
    let token: string | null = null;
    try {
      // `context.reqHeaders` may be a Headers instance (from RequestHeadersPlugin)
      // or a plain object. Handle both cases.
      if (rawHeaders && typeof (rawHeaders as any).get === "function") {
        const h = rawHeaders as unknown as Headers;
        const ah = (h.get("authorization") || h.get("Authorization")) as
          | string
          | null;
        if (ah && ah.startsWith("Bearer ")) token = ah.slice(7);
        if (!token) {
          const xt = (h.get("x-session-token") || h.get("x-token")) as
            | string
            | null;
          if (xt) token = xt;
        }
      } else {
        const h = rawHeaders as unknown as Record<
          string,
          string | string[] | undefined
        >;
        const authHeader = h["authorization"] || h["Authorization"];
        const ah = Array.isArray(authHeader) ? authHeader[0] : authHeader;
        if (typeof ah === "string" && ah.startsWith("Bearer "))
          token = ah.slice(7);
        if (!token) {
          const xt = h["x-session-token"] || h["x-token"];
          token = Array.isArray(xt)
            ? (xt[0] as string)
            : (xt as string) || null;
        }
      }
    } catch (e) {
      token = null;
    }

    let session: any = null;
    if (token) {
      // Resolve session by token using Prisma to avoid an HTTP round-trip.
      const dbSession = await prisma.session.findUnique({ where: { token } });
      console.debug(
        "authMiddleware: dbSession=",
        dbSession
          ? {
              id: dbSession.id,
              userId: dbSession.userId,
              expiresAt: dbSession.expiresAt,
            }
          : null
      );
      if (dbSession && new Date(dbSession.expiresAt) >= new Date()) {
        const user = await prisma.user.findUnique({
          where: { id: dbSession.userId },
        });
        session = { user, session: dbSession };
      } else {
        throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
      }
    } else {
      // Build a Request from forwarded headers so getSession can read cookies.
      const req = new Request("http://localhost", {
        headers: context.reqHeaders as HeadersInit,
      });
      // Use server-side auth API so cookie parsing is performed by the same
      // runtime that issued the session cookie.
      session = await auth.api.getSession(req as unknown as Request);
      if (!session || !session.user) {
        throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
      }
      // Validate personal:<userId> markers to prevent session hijacking.
      try {
        const activeOrg = session?.session?.activeOrganizationId;
        if (
          typeof activeOrg === "string" &&
          activeOrg.startsWith("personal:")
        ) {
          const uid = activeOrg.split(":")[1];
          if (!uid || uid !== session.user.id) {
            // clear invalid personal marker
            session.session.activeOrganizationId = null;
          }
        }
      } catch (e) {
        // ignore validation errors
      }
    }
    const result = await next({ context: { ...context, session } });
    return result;
  });
