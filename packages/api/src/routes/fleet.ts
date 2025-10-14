import prisma from "@sailviz/db";

export async function findFleet(id: string) {
  var result = await prisma.fleet.findUnique({
    where: {
      id: id,
    },
    include: {
      results: {
        include: {
          laps: true,
          boat: true,
        },
      },
      fleetSettings: true,
    },
  });
  return result;
}
