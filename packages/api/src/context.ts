import { os } from "@orpc/server";
import { getSession, type Session } from "@sailviz/auth";

export const withSession = os
  .$context<{ session?: Session }>()
  .errors({
    UNAUTHORIZED: { message: "Login required" },
  })
  .use(async ({ req, next, errors }) => {
    const session = await getSession(req);
    if (!session?.userId) throw errors.UNAUTHORIZED();
    return next({ context: { session } });
  });
