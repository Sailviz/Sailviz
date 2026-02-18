import { implement, ORPCError } from "@orpc/server";
import prisma from "@sailviz/db";
import { ORPCcontract } from "../contract";
import { getOrg } from "./organization";

const os = implement(ORPCcontract);

//TODO change this to return count of races per series, don't need all the data when loading this many series.
export async function findOrgSeries(orgId: string, includeRaces: boolean) {
  var result = await prisma.series.findMany({
    where: {
      orgId: orgId,
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

export async function findSeries(id: string, includeRaces: boolean) {
  var result = await prisma.series.findUnique({
    where: {
      id: id,
    },
    include: {
      races: includeRaces,
      fleetSettings: true,
    },
  });
  return result;
}

export const seriesbyClubId = os.series.club.handler(async ({ input }) => {
  console.log(input);
  const series = await findOrgSeries(input.orgId, input.includeRaces);
  if (series) {
    return series;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});

export const createSeries = os.series.create.handler(async ({ input }) => {
  const club = await getOrg(input.orgId);
  const newSeries = await prisma.series.create({
    data: {
      name: input.name,
      settings: {
        numberToCount: 0,
        pursuitLength: club.orgData!.defaultPursuitLength,
      },
      organization: {
        connect: {
          id: input.orgId,
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
      races: {
        include: {
          fleets: {
            include: {
              results: true,
              fleetSettings: true,
            },
          },
        },
      },
    },
  });
  if (series) {
    return series;
  } else {
    throw new ORPCError("NOT_FOUND");
  }
});

export const series_update = os.series.update.handler(
  async ({ input }: { input: any }) => {
    const updatedSeries = await prisma.series.update({
      where: { id: input.id },
      data: {
        settings: input.settings,
        name: input.name,
      },
      include: {
        fleetSettings: true,
      },
    });
    if (updatedSeries) {
      return updatedSeries;
    } else {
      throw new ORPCError("BAD_REQUEST");
    }
  },
);
