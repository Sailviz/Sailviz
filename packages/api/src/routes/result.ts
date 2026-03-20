import { implement, ORPCError } from "@orpc/server";
import prisma from "@sailviz/db";
import { ORPCcontract } from "../contract";

const os = implement(ORPCcontract);

export const createResult = os.result.create.handler(
  async ({ input, context }) => {
    const newResult = await prisma.result.create({
      data: {
        Helm: "",
        Crew: "",
        SailNumber: "",
        finishTime: 0,
        CorrectedTime: 0,
        PursuitPosition: 0,
        HandicapPosition: 0,
        isDeleted: false,
        fleet: {
          connect: {
            id: input.fleetId,
          },
        },
        boat: {},
        laps: {},
        numberLaps: 0,
        resultCode: "",
      },
      include: {
        laps: true,
        fleet: true,
      },
    });
    if (newResult) {
      return newResult;
    } else {
      throw new ORPCError("BAD_REQUEST");
    }
  }
);

export const updateResult = os.result.update.handler(
  async ({ input, context }) => {
    await prisma.result.update({
      where: {
        id: input.id,
      },
      data: {
        boat: {
          connect: {
            id: input.boat.id,
          },
        },
      },
    });
    const updatedResult = await prisma.result.update({
      where: { id: input.id },
      data: {
        SailNumber: input.SailNumber,
        CorrectedTime: input.CorrectedTime,
        Crew: input.Crew,
        Helm: input.Helm,
        finishTime: input.finishTime,
        resultCode: input.resultCode,
        PursuitPosition: input.PursuitPosition,
        HandicapPosition: input.HandicapPosition,
        fleetId: input.fleetId,
        numberLaps: input.numberLaps,
        userId: input.userId,
      },
      include: {
        laps: true,
        fleet: true,
      },
    });
    if (updatedResult) {
      return updatedResult;
    } else {
      throw new ORPCError("BAD_REQUEST");
    }
  }
);

export const deleteResult = os.result.delete.handler(async ({ input }) => {
  const res = await prisma.result.delete({
    where: {
      id: input.id,
    },
    include: {
      laps: true,
      fleet: true,
    },
  });
  if (res) {
    return res;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});
