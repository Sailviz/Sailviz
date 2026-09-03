import prisma from "@sailviz/db";
import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "../../contract";
import { authMiddleware } from "../../middleware";
import * as Types from "@sailviz/types";
const os = implement(ORPCcontract);

export async function findUsers(
  take: number,
  skip: number,
  search: string | null,
) {
  var users = await prisma.user.findMany({
    where: {
      name: search
        ? {
            contains: search,
          }
        : undefined,
    },
    take: take,
    skip: skip,
  });
  return { users };
}

export const social_findUsers = os.social.find_users
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any; // this is because the session type is not quite correct
    const userId = session?.user.id;
    if (!userId) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "User not authenticated",
      });
    }
    const users = await findUsers(
      input.pageSize,
      (input.page - 1) * input.pageSize,
      input.search,
    );
    if (users) {
      return users.users;
    } else {
      throw new ORPCError("BAD_REQUEST");
    }
  });
