import { os, ORPCError } from "@orpc/server";
import prisma from "@sailviz/db";
import { withSession } from "../context";

export const getClub = withSession.handler(async ({ context }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
  }
  const clubId = context.session?.user.clubId;
  if (!clubId) {
    throw new ORPCError("BAD_REQUEST");
  }
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: { stripe: true },
  });
  if (!club) {
    throw new ORPCError("NOT_FOUND");
  }
  return club;
});
