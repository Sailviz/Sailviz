import { implement, ORPCError } from "@orpc/server";
import prisma from "@sailviz/db";
import { ORPCcontract } from "../contract";
import { getClub } from "./club";

const os = implement(ORPCcontract);

export const lap_create = os.lap.create.handler(async ({ input }) => {
  const newLap = await prisma.lap.create({
    data: {
      time: input.time,
      isDeleted: false,
      result: {
        connect: {
          id: input.resultId,
        },
      },
    },
  });
  if (newLap) {
    return newLap;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});

export const lap_delete = os.lap.delete.handler(async ({ input }) => {
  const deletedLap = await prisma.lap.delete({
    where: { id: input.lapId },
  });
  if (deletedLap) {
    return deletedLap;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});
