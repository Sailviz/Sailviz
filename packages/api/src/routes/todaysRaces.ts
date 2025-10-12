import prisma from "@sailviz/db";
import dayjs from "dayjs";
import { os, ORPCError } from "@orpc/server";

export async function findTodaysRace(clubId: string) {
  var result = await prisma.race.findMany({
    where: {
      AND: [
        {
          Time: {
            gte: dayjs()
              .set("hour", 0)
              .set("minute", 0)
              .set("second", 0)
              .format("YYYY-MM-DD HH:ss"),
            lte: dayjs()
              .set("hour", 24)
              .set("minute", 0)
              .set("second", 0)
              .format("YYYY-MM-DD HH:ss"),
          },
        },
        {
          series: {
            clubId: clubId,
          },
        },
      ],
    },
    orderBy: {
      Time: "asc",
    },
    include: {
      fleets: {
        include: {
          fleetSettings: true,
        },
      },
      series: true,
    },
  });
  return result;
}
