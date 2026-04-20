import { implement, ORPCError } from "@orpc/server";
import prisma from "@sailviz/db";
import { ORPCcontract } from "../contract";
import { getOrg } from "./organization";
import { start } from "node:repl";

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
    // create a default fleet setting for the series
    const fleetSettings = await prisma.fleetSettings.create({
      data: {
        name: "Main Fleet",
        series: {
          connect: {
            id: newSeries.id,
          },
        },
      },
    });
    const startSequence = getFiveStartSequence(fleetSettings.id);
    startSequence.forEach(async (step: any) => {
      await prisma.startSequence.create({
        data: {
          seriesId: newSeries.id,
          time: step.time,
          name: step.name,
          order: step.order,
          hoot: step.hoot,
          flagStatus: step.flagStatus,
          fleetStart: step.fleetStart,
        },
      });
    });
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
              results: {
                include: {
                  boat: true,
                },
              },
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

function getFiveStartSequence(fleetId: string) {
  return [
    {
      time: 315,
      name: "warning",
      order: 0,
      hoot: 0,
      flagStatus: [
        { flag: "h", status: false },
        { flag: "p", status: false },
      ],
      fleetStart: "",
    },
    {
      time: 300,
      name: "5 minutes",
      order: 1,
      hoot: 300,
      flagStatus: [
        { flag: "h", status: true },
        { flag: "p", status: false },
      ],
      fleetStart: "",
    },
    {
      time: 240,
      name: "4 minutes",
      order: 2,
      hoot: 300,
      flagStatus: [
        { flag: "h", status: true },
        { flag: "p", status: true },
      ],
      fleetStart: "",
    },
    {
      time: 60,
      name: "1 minute",
      order: 3,
      hoot: 500,
      flagStatus: [
        { flag: "h", status: true },
        { flag: "p", status: false },
      ],
      fleetStart: "",
    },
    {
      time: 0,
      name: "Start",
      order: 4,
      hoot: 300,
      flagStatus: [
        { flag: "h", status: false },
        { flag: "p", status: false },
      ],
      fleetStart: fleetId,
    },
  ];
}
