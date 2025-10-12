import prisma from "@sailviz/db";

export async function findBoats(clubId: string) {
  var result = await prisma.boat.findMany({
    where: {
      clubId: clubId,
    },
    orderBy: {
      name: "asc",
    },
  });
  return result;
}
