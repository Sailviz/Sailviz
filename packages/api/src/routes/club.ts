import prisma from "@sailviz/db";
import { ClubType } from "packages/types/src/types";
import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "../contract";

const os = implement(ORPCcontract);

export async function getClub(clubId: string) {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
  });
  return club as unknown as ClubType; //have to do unknown as settings isn't typed in db
}

export async function updateClubById(input: any) {
  const club = await prisma.club.update({
    where: { id: input.id },
    data: input,
  });
  return club as unknown as ClubType;
}

export const club_all = os.club.all.handler(async ({ input }) => {
  const clubs = await prisma.club.findMany();
  return clubs as unknown as ClubType[];
});
