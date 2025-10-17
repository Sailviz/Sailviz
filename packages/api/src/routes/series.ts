import { implement, ORPCError } from "@orpc/server";
import prisma from "@sailviz/db";
import { ORPCcontract } from "../contract";
import { getClub } from "./club";

const os = implement(ORPCcontract);

export async function findClubSeries(clubId: string, includeRaces: boolean) {
  var result = await prisma.series.findMany({
    where: {
      clubId: clubId,
    },
    include: {
      races: includeRaces,
      fleetSettings: true,
    },
  });
  return result;
}

export async function findSeries(id: string, includeRaces: boolean) {
  var result = await prisma.series.findUnique({
    where: {
      id: id,
    },
    include: {
      ...(includeRaces
        ? {
            races: {
              include: {
                fleets: {
                  include: {
                    fleetSettings: true,
                  },
                },
              },
            },
          }
        : {}),
      fleetSettings: true,
    },
  });
  return result;
}

export const seriesbyClubId = os.series.club.handler(async ({ input }) => {
  console.log(input);
  const series = await findClubSeries(input.clubId, input.includeRaces);
  console.log(series);
  console.log(series[1].races);
  if (series) {
    return series;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});

export const createSeries = os.series.create.handler(async ({ input }) => {
  const club = await getClub(input.clubId);
  const newSeries = await prisma.series.create({
    data: {
      name: input.name,
      settings: {
        numberToCount: 0,
        pursuitLength: club.settings.pursuitLength,
      },
      club: {
        connect: {
          id: input.clubId,
        },
      },
    },
    include: {
      fleetSettings: true,
    },
  });
  console.log(newSeries);
  if (newSeries) {
    return newSeries;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});

export const deleteSeries = os.series.delete.handler(async ({ input }) => {
  const deletedSeries = await prisma.series.delete({
    where: {
      id: input.seriesId,
    },
    include: {
      fleetSettings: true,
    },
  });
  if (deletedSeries) {
    return deletedSeries;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});

export const getSeries = os.series.find.handler(async ({ input }) => {
  const series = await prisma.series.findUnique({
    where: { id: input.seriesId },
    include: {
      fleetSettings: true,
      club: true,
      races: true,
    },
  });
  if (series) {
    return series;
  } else {
    throw new ORPCError("NOT_FOUND");
  }
});
