import prisma from "@sailviz/db";

export async function getClub(clubId: string) {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
  });
  return club;
}
