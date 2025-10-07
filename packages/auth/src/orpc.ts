import { os } from "@orpc/server";
import { getSession, Session } from "@sailviz/auth";

export const withSession = os
  .$context<{ session?: Session; req: Request }>() // 👈 include req here
  .errors({
    UNAUTHORIZED: { message: "Login required" },
  })
  .use(async ({ context, next, errors }) => {
    const session = await getSession(context.req);
    if (!session?.userId) throw errors.UNAUTHORIZED();
    return next({ context: { ...context, session } });
  });
