import prisma from "@sailviz/db";

export async function getClub(clubId: string) {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
  });
  return club;
}

export async function updateClubById(input: any) {
  const club = await prisma.club.update({
    where: { id: input.id },
    data: input,
  });
  return club;
}
