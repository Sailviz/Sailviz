import { implement, ORPCError } from "@orpc/server";
import prisma from "@sailviz/db";
import { ORPCcontract } from "../contract";
import { getOrg } from "./organization";

const os = implement(ORPCcontract);

//TODO change this to return count of races per series, don't need all the data when loading this many series.
export async function findOrgSeries(
  orgId: string,
  take: number,
  skip: number,
  search: string | null,
  includeRaces: boolean,
  tagNames: string[] | undefined,
) {
  const count = await prisma.series.count({
    where: {
      orgId: orgId,
      name: search
        ? {
            contains: search,
          }
        : undefined,
      AND:
        tagNames && tagNames.length > 0
          ? tagNames.map((tagName) => ({
              tags: { some: { name: tagName } },
            }))
          : undefined,
    },
  });

  var result = await prisma.series.findMany({
    where: {
      orgId: orgId,
      name: search
        ? {
            contains: search,
          }
        : undefined,
      AND:
        tagNames && tagNames.length > 0
          ? tagNames.map((tagName) => ({
              tags: { some: { name: tagName } },
            }))
          : undefined,
    },
    take: take,
    skip: skip,
    include: {
      fleetSettings: true,
      tags: true,
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
    },
  });
  return { seriesCount: count, series: result };
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
  const tags = input.tags ? input.tags.split(".") : undefined;
  const series = await findOrgSeries(
    input.orgId,
    input.pageSize,
    (input.page - 1) * input.pageSize,
    input.search,
    false,
    tags,
  );
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
        maintainSequence: 0,
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
      tags: true,
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
        classFlag: {
          connect: {
            id: club.orgData!.defaultClassFlag.id,
          },
        },
        preparatoryFlag: {
          connect: {
            id: club.orgData!.defaultPreparatoryFlag.id,
          },
        },
      },
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
      tags: true,
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
      tags: true,
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

export const series_update = os.series.update.handler(async ({ input }) => {
  const updatedSeries = await prisma.series.update({
    where: { id: input.id },
    data: {
      settings: input.settings,
      name: input.name,
      startSequence: input.startSequence,
    },
    include: {
      fleetSettings: true,
      tags: true,
    },
  });
  if (updatedSeries) {
    return updatedSeries;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});

export const series_tags_update = os.series.tags.update.handler(
  async ({ input }) => {
    const series = await prisma.series.findUnique({
      where: { id: input.seriesId },
      include: {
        tags: true,
      },
    });
    if (!series) {
      throw new ORPCError("NOT_FOUND");
    }
    //get tags for an org
    const availableTags = await prisma.tag.findMany({
      where: {
        orgId: input.orgId,
      },
    });
    //check if any of the tags in the input don't have an id, if they don't find them in the available tags and connect them, if they don't exist create them and connect them
    const tagsToConnect = [];
    for (const tag of input.tags) {
      const existingTag = availableTags.find((t) => t.name === tag);
      if (existingTag) {
        tagsToConnect.push({ id: existingTag.id });
      } else {
        const newTag = await prisma.tag.create({
          data: {
            name: tag,
            organization: {
              connect: {
                id: input.orgId,
              },
            },
          },
        });
        tagsToConnect.push({ id: newTag.id });
      }
    }

    console.log("tagsToConnect", tagsToConnect);

    await prisma.series.update({
      where: { id: input.seriesId },
      data: {
        tags: {
          set: [],
        },
      },
    });

    const updatedSeries = await prisma.series.update({
      where: { id: input.seriesId },
      data: {
        tags: {
          connect: tagsToConnect,
        },
      },
      include: {
        fleetSettings: true,
        tags: true,
      },
    });
    return updatedSeries;
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
