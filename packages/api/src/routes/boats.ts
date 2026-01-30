import prisma from "@sailviz/db";
import { BoatType } from "packages/types/src/types";
import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "../contract";
import { authMiddleware } from "../middleware";
const os = implement(ORPCcontract);

export async function findBoats(orgId: string) {
  var result = await prisma.boat.findMany({
    where: {
      orgId: orgId,
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
      organization: {
        connect: {
          id: input.orgId,
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

export const boat_update = os.boat.update
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const updatedBoat = await updateBoatById(input);
    if (!updatedBoat) {
      throw new ORPCError("BAD_REQUEST", { message: "Could not update boat" });
    }
    return updatedBoat;
  });

export const boat_find = os.boat.find
  .use(authMiddleware)
  .handler(async ({ input }) => {
    const boat = await findBoat(input.boatId);
    if (boat) {
      return boat;
    } else {
      throw new ORPCError("NOT_FOUND");
    }
  });

export const boat_session = os.boat.session
  .use(authMiddleware)
  .handler(async ({ context }) => {
    const session = context.session as any; // this is because the session type is not quite correct
    const clubId = session?.session.activeOrganizationId;
    const boatsList = await findBoats(clubId);
    if (boatsList) {
      return boatsList;
    } else {
      throw new ORPCError("NOT_FOUND");
    }
  });

export const boat_org = os.boat.org
  .use(authMiddleware)
  .handler(async ({ input }) => {
    const boatsList = await findBoats(input.orgId);
    if (boatsList) {
      return boatsList;
    } else {
      throw new ORPCError("NOT_FOUND");
    }
  });
