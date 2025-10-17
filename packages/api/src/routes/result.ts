import { implement, ORPCError } from "@orpc/server";
import prisma from "@sailviz/db";
import { ORPCcontract } from "../contract";

const os = implement(ORPCcontract);

export const createResult = os.result.create.handler(async ({ input }) => {
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
});

export const updateResult = os.result.update.handler(async ({ input }) => {
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
});
