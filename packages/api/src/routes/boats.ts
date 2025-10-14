import prisma from "@sailviz/db";
import { BoatType } from "packages/types/src/types";

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
