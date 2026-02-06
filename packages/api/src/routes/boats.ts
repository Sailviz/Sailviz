import prisma from "@sailviz/db";
import { BoatType } from "packages/types/src/types";
import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "../contract";
import { authMiddleware } from "../middleware";
const os = implement(ORPCcontract);

export async function findBoats(orgId: string) {
  var standardBoats = await prisma.boat.findMany({
    orderBy: {
      name: "asc",
    },
  });
  var modifications = await prisma.boatOverride.findMany({
    where: {
      orgId: orgId,
    },
  });
  //go through boats, and apply any modifications
  var result: BoatType[] = [];
  standardBoats.forEach((boat) => {
    var modifiedBoat = modifications.find((mod) => mod.boatId === boat.id);
    if (modifiedBoat) {
      result.push({
        ...boat,
        py: modifiedBoat.py,
        pursuitStartTime: modifiedBoat.pursuitStartTime,
      });
    } else {
      result.push({ ...boat, pursuitStartTime: 0 });
    }
  });
  return result;
}

export async function findBoat(
  boatId: string,
  orgId: string,
): Promise<BoatType> {
  var standard = await prisma.boat.findUnique({
    where: {
      id: boatId,
    },
  });
  if (!standard) {
    throw new ORPCError("NOT_FOUND");
  }
  var modification = await prisma.boatOverride.findFirst({
    where: {
      orgId: orgId,
      boatId: boatId,
    },
  });
  const boat = {
    ...standard,
    py: modification ? modification.py : standard.py,
    crew: modification ? modification.crew : standard.crew,
    pursuitStartTime: modification ? modification.pursuitStartTime : 0,
    organizationId: orgId,
  } as BoatType;

  return boat;
}

export const boat_standard_create = os.boat.standard.create.handler(
  async ({ input }) => {
    const newBoat = await prisma.boat.create({
      data: {
        name: input.name,
        crew: input.crew,
        py: input.py,
      },
    });
    if (newBoat) {
      return newBoat;
    } else {
      throw new ORPCError("Boat not created");
    }
  },
);

export const boat_standard_delete = os.boat.standard.delete.handler(
  async ({ input }) => {
    const deletedBoat = await prisma.boat.delete({
      where: { id: input.boatId },
    });
    if (deletedBoat) {
      return deletedBoat;
    } else {
      throw new ORPCError("BAD_REQUEST");
    }
  },
);

export const boat_standard_update = os.boat.standard.update
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const updatedBoat = await prisma.boat.update({
      where: { id: input.id },
      data: input,
    });
    if (!updatedBoat) {
      throw new ORPCError("BAD_REQUEST", { message: "Could not update boat" });
    }
    return updatedBoat;
  });

export const boat_standard_find = os.boat.standard.find
  .use(authMiddleware)
  .handler(async ({ input }) => {
    const boat = await prisma.boat.findUnique({
      where: {
        id: input.boatId,
      },
    });
    if (boat) {
      return boat;
    } else {
      throw new ORPCError("NOT_FOUND");
    }
  });

export const boat_org_session = os.boat.org.session
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

export const boat_org_all = os.boat.org.all
  .use(authMiddleware)
  .handler(async ({ input }) => {
    const boatsList = await findBoats(input.orgId);
    if (boatsList) {
      return boatsList;
    } else {
      throw new ORPCError("NOT_FOUND");
    }
  });

export const boat_standard_all = os.boat.standard.all.handler(async () => {
  const boatsList = await prisma.boat.findMany({
    orderBy: {
      name: "asc",
    },
  });
  if (boatsList) {
    return boatsList;
  } else {
    throw new ORPCError("NOT_FOUND");
  }
});

export const boat_org_update = os.boat.org.update
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    const clubId = session?.session.activeOrganizationId as string;
    const boatOverride = await prisma.boatOverride.findFirst({
      where: {
        boatId: input.id,
        orgId: clubId,
      },
    });
    if (boatOverride) {
      const updatedOverride = await prisma.boatOverride.update({
        where: {
          id: boatOverride.id,
        },
        data: {
          py: input.py,
          pursuitStartTime: input.pursuitStartTime,
        },
      });
    } else {
      const newOverride = await prisma.boatOverride.create({
        data: {
          boat: {
            connect: {
              id: input.id,
            },
          },
          organization: {
            connect: {
              id: clubId,
            },
          },
          py: input.py,
          pursuitStartTime: input.pursuitStartTime,
          crew: input.crew,
        },
      });
    }
    const boat = await findBoat(input.id, clubId);
    if (boat) {
      return boat;
    } else {
      throw new ORPCError("NOT_FOUND");
    }
  });

export const boat_org_delete = os.boat.org.delete
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    const clubId = session?.session.activeOrganizationId as string;
    const boatOverride = await prisma.boatOverride.findFirst({
      where: {
        boatId: input.boatId,
        orgId: clubId,
      },
    });
    if (!boatOverride) {
      throw new ORPCError("NOT_FOUND", {
        message: "No customisation found for this boat",
      });
    }
    await prisma.boatOverride.delete({
      where: {
        id: boatOverride.id,
      },
    });
    const boat = await findBoat(input.boatId, clubId);
    if (boat) {
      return boat;
    } else {
      throw new ORPCError("NOT_FOUND");
    }
  });
