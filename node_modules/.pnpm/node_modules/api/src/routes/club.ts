import { os, ORPCError } from "@orpc/server";
import prisma from "@sailviz/db";

export const getClub = os
  .$context<{ headers: Record<string, string | string[] | undefined> }>()
  .handler(async ({ context }) => {
    // const session = await auth.api.getSession({ headers: context.headers });
    // const clubId = session?.user.clubId;
    // if (!clubId) {
    //   throw new ORPCError("BAD_REQUEST");
    // }
    // const club = await prisma.club.findUnique({
    //   where: { id: clubId },
    //   include: { stripe: true },
    // });
    // if (!club) {
    //   throw new ORPCError("NOT_FOUND");
    // }
    // return club;
  });
