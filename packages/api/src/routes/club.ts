import prisma from "@sailviz/db";
import { ClubType } from "packages/types/src/types";

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
