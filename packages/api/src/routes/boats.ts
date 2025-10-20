import prisma from "@sailviz/db";
import { BoatType } from "packages/types/src/types";
import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "../contract";

const os = implement(ORPCcontract);

export async function findBoats(clubId: string) {
  var result = await prisma.boat.findMany({
    where: {
      clubId: clubId,
    },
    orderBy: {
      name: "asc",
    },
  });
  return result;
}

export async function updateBoatById(boat: BoatType) {
  const updatedBoat = await prisma.boat.update({
    where: { id: boat.id },
    data: boat,
  });
  return updatedBoat;
}

export async function findBoat(boatId: string) {
  var result = await prisma.boat.findUnique({
    where: {
      id: boatId,
    },
  });
  return result;
}

export const boat_create = os.boat.create.handler(async ({ input }) => {
  const newBoat = await prisma.boat.create({
    data: {
      name: input.name,
      crew: input.crew,
      py: input.py,
      pursuitStartTime: input.pursuitStartTime,
      club: {
        connect: {
          id: input.clubId,
        },
      },
    },
  });
  if (newBoat) {
    return newBoat;
  } else {
    throw new ORPCError("Boat not created");
  }
});

export const boat_delete = os.boat.delete.handler(async ({ input }) => {
  const deletedBoat = await prisma.boat.delete({
    where: { id: input.boatId },
  });
  if (deletedBoat) {
    return deletedBoat;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});
