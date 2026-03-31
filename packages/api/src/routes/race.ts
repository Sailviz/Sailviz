import prisma from "@sailviz/db";
import dayjs from "dayjs";
import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "../contract";
import { RaceType } from "packages/types/src/types";
import { findOrgSeries } from "./series";

const os = implement(ORPCcontract);

export async function findTodaysRace(orgId: string) {
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
            orgId: orgId,
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
  historical: boolean,
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
          fleetSettings: true,
          results: {
            where: {
              isDeleted: false,
            },
            include: {
              boat: true,
              laps: {
                where: {
                  isDeleted: false,
                },
                orderBy: {
                  time: "asc",
                },
              },
            },
          },
        },
      },
    },
  });
  return result;
}

export async function findRacesForUser(
  userId: string,
  skip = 0,
  take = 50,
  date = dayjs().toISOString(),
  historical = false,
) {
  const where: any = {
    fleets: {
      some: {
        results: {
          some: {
            userId: userId,
          },
        },
      },
    },
    ...(historical ? { Time: { lte: date } } : { Time: { gte: date } }),
  };

  const result = await prisma.race.findMany({
    skip,
    take,
    where,
    include: {
      series: true,
      fleets: {
        include: {
          fleetSettings: true,
          results: {
            include: {
              boat: true,
              laps: true,
            },
          },
        },
      },
    },
    orderBy: {
      Time: historical ? "desc" : "asc",
    },
  });
  return result;
}

export async function findTodaysRacesScoped(scope: {
  type: string;
  clubId?: string;
  userId?: string;
}) {
  if (scope.type === "club") {
    if (!scope.clubId) return [];
    return await findTodaysRace(scope.clubId);
  }
  if (scope.type === "personal") {
    if (!scope.userId) return [];
    // use start/end of today
    const start = dayjs()
      .set("hour", 0)
      .set("minute", 0)
      .set("second", 0)
      .format("YYYY-MM-DD HH:ss");
    const end = dayjs()
      .set("hour", 24)
      .set("minute", 0)
      .set("second", 0)
      .format("YYYY-MM-DD HH:ss");
    const result = await prisma.race.findMany({
      where: {
        AND: [
          { Time: { gte: start, lte: end } },
          {
            fleets: {
              some: {
                results: {
                  some: {
                    userId: scope.userId,
                  },
                },
              },
            },
          },
        ],
      },
      orderBy: { Time: "asc" },
      include: {
        fleets: {
          include: {
            fleetSettings: true,
            results: { include: { boat: true, laps: true } },
          },
        },
        series: true,
      },
    });
    return result;
  }
  return [];
}

export async function countRaces(
  seriesId: string[],
  date: string,
  historical: boolean,
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

export const updateRace = os.race.update.handler(
  async ({ input }: { input: any }) => {
    const updatedRace = await prisma.race.update({
      where: { id: input.id },
      data: {
        Duties: input.Duties,
        Time: input.Time,
        Type: input.Type,
        trackableEventId: input.trackableEventId,
      },
      include: {
        series: true,
        fleets: {
          include: {
            fleetSettings: true,
          },
        },
      },
    });
    if (updatedRace) {
      return updatedRace;
    } else {
      throw new ORPCError("BAD_REQUEST");
    }
  },
);

export const race_delete = os.race.delete.handler(async ({ input }) => {
  const deletedRace = await prisma.race.delete({
    where: { id: input.id },
    include: {
      fleets: {
        include: {
          fleetSettings: true,
        },
      },
      series: true,
    },
  });
  if (deletedRace) {
    return deletedRace;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});

export const race_today = os.race.today.handler(async ({ input }) => {
  const races = await findTodaysRace(input.orgId);
  return races;
});

export const race_create = os.race.create.handler(async ({ input }) => {
  const series = await prisma.series.findUnique({
    where: { id: input.seriesId },
  });
  if (!series) {
    throw new ORPCError("Series not found");
  }
  const club = await prisma.organization.findUnique({
    where: { id: series.orgId },
  });

  let duties = await prisma.duties.findMany({
    where: { orgDataId: club?.orgDataId },
  });
  //create json with key value pairs of duty name and duty id
  let dutiesJson: { [key: string]: string } = {};
  duties.forEach((d) => {
    dutiesJson[d.name] = "";
  });

  var races: RaceType[] = await prisma.race.findMany({
    where: {
      seriesId: input.seriesId,
    },
    include: {
      series: true,
      fleets: {
        include: {
          fleetSettings: true,
        },
      },
    },
  });
  var number = 1;
  //this numbers the race with the lowest number that is not being used.
  while (races.some((object) => object.number === number)) {
    number++;
  }

  const newRace = await prisma.race.create({
    data: {
      number: number,
      Time: dayjs().format("YYYY-MM-DD HH:mm:ss.SSS"),
      Type: "Handicap",
      Duties: dutiesJson,
      series: {
        connect: {
          id: input.seriesId,
        },
      },
    },
    include: {
      series: true,
      fleets: {
        include: {
          fleetSettings: true,
        },
      },
    },
  });
  var fleets = await prisma.fleetSettings.findMany({
    where: {
      seriesId: input.seriesId,
    },
  });
  console.log("fleets in series:");
  console.log(fleets);
  // create fleet for each fleet setting
  await Promise.all(
    fleets.map(async (fleet) => {
      console.log("creating fleet for fleet setting: " + fleet.id);
      const newFleet = await prisma.fleet.create({
        data: {
          startTime: 0,
          fleetSettings: {
            connect: {
              id: fleet.id,
            },
          },
          race: {
            connect: {
              id: newRace.id,
            },
          },
        },
      });
      console.log("created fleet: ");
      console.log(newFleet);
    }),
  );

  const race = await findRace(newRace.id);
  console.log(race);

  if (race) {
    return race;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});

export const race_org = os.race.org.handler(async ({ input }) => {
  const series = await findOrgSeries(input.orgId, true);

  if (!series || series.length === 0) {
    throw new ORPCError("NOT_FOUND");
  }

  const count = await countRaces(
    series.map((s) => s.id),
    input.date,
    input.historical,
  );
  const races = await findRaces(
    series.map((s) => s.id),
    input.page ?? 0,
    100,
    input.date,
    input.historical ?? false,
  );
  return { races, count };
});

export const race_find = os.race.find.handler(async ({ input }) => {
  const race = await findRace(input.raceId);
  if (race) {
    return race as RaceType;
  } else {
    throw new ORPCError("NOT_FOUND");
  }
});
