import prisma from "@sailviz/db";

export async function findSeries(id: string) {
  var result = await prisma.series.findMany({
    where: {
      clubId: id,
    },
  });
  return result;
}
