import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "./contract";
import { RequestHeadersPluginContext } from "@orpc/server/plugins";
import { auth } from "@sailviz/auth/auth";
const os = implement(ORPCcontract);

export const authMiddleware = os
  .$context<RequestHeadersPluginContext>()
  .middleware(async ({ context, next }) => {
    // Get session from Better Auth
    const session = await auth.api.getSession({ headers: context.reqHeaders! });
    // Optionally enforce authentication
    if (!session) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const result = await next({
      context: {
        ...context,
        session,
      },
    });
    return result;
  });
