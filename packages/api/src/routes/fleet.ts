import { implement, ORPCError } from "@orpc/server";
import prisma from "@sailviz/db";
import { ORPCcontract } from "../contract";
import { StartSequenceStepType } from "@sailviz/types";
import { findSeries } from "./series";

const os = implement(ORPCcontract);

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

async function createFleet(raceId: string, fleetSettingsId: string) {
  var res = await prisma.fleet.create({
    data: {
      startTime: 0,
      race: {
        connect: {
          id: raceId,
        },
      },
      fleetSettings: {
        connect: {
          id: fleetSettingsId,
        },
      },
    },
  });
  return res;
}

export const createFleetSettings = os.fleet.settings.create.handler(
  async ({ input }) => {
    const newFleetSettings = await prisma.fleetSettings.create({
      data: {
        name: "Fleet",
        series: {
          connect: {
            id: input.seriesId,
          },
        },
      },
    });
    if (newFleetSettings) {
      // we then need to add a new fleet to each race in the series
      const series = await findSeries(input.seriesId, true);
      series.races.forEach((race) => {
        createFleet(race.id, newFleetSettings.id);
      });
      return newFleetSettings;
    } else {
      throw new ORPCError("BAD_REQUEST");
    }
  }
);

export const fleet_settings_find = os.fleet.settings.find.handler(
  async ({ input }) => {
    const fleetSettings = await prisma.fleetSettings.findMany({
      where: {
        seriesId: input.seriesId,
      },
    });
    return fleetSettings;
  }
);

export const fleet_settings_delete = os.fleet.settings.delete.handler(
  async ({ input }) => {
    const deletedFleetSettings = await prisma.fleetSettings.delete({
      where: { id: input.fleetSettingsId },
    });
    if (deletedFleetSettings) {
      return deletedFleetSettings;
    } else {
      throw new ORPCError("BAD_REQUEST");
    }
  }
);
