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
    // Build a Request from forwarded headers so getSession can read cookies.
    const req = new Request("http://localhost", {
      headers: context.reqHeaders as HeadersInit,
    });
    // Use server-side auth API so cookie parsing is performed by the same
    // runtime that issued the session cookie.
    const session = await auth.api.getSession(req as unknown as Request);
    const result = await next({
      context: {
        ...context,
        session,
      },
    });
    return result;
  });
