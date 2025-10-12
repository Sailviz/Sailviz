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

export async function findRaces(
  seriesId: string[],
  skip: number,
  take: number,
  date: string,
  historical: boolean
) {
  var result = await prisma.race.findMany({
    skip: skip,
    take: take,
    where: {
      seriesId: {
        in: seriesId,
      },
      ...(historical ? { Time: { lte: date } } : { Time: { gte: date } }),
    },
    include: {
      series: true,
      fleets: {
        include: {
          fleetSettings: true,
        },
      },
    },
    orderBy: {
      Time: historical ? "desc" : "asc",
    },
  });
  return result;
}

export async function findRace(id: string) {
  var result = await prisma.race.findUnique({
    where: {
      id: id,
    },
    include: {
      series: true,
      fleets: {
        include: {
          results: {
            include: {
              laps: true,
              boat: true,
            },
          },
          fleetSettings: true,
        },
      },
    },
  });
  return result;
}

export async function countRaces(
  seriesId: string[],
  date: string,
  historical: boolean
) {
  var result = await prisma.race.count({
    where: {
      seriesId: {
        in: seriesId,
      },
      ...(historical ? { Time: { lte: date } } : { Time: { gte: date } }),
    },
  });
  return result;
}
