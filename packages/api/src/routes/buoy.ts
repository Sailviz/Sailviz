import prisma from "@sailviz/db";
import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "../contract";
import { authMiddleware } from "../middleware";
const os = implement(ORPCcontract);

export const buoy_create = os.buoy.create
  .use(authMiddleware)
  .handler(async ({ context, input }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const orgId = session.session.activeOrganizationId;

    const newBuoy = await prisma.buoy.create({
      data: {
        name: input.name,
        isMoveable: input.isMoveable,
        isStartLine: input.isStartLine,
        lat: 0,
        lon: 0,
        trackerId: "",
        organization: {
          connect: { id: orgId },
        },
      },
    });
    return newBuoy;
  });

export const buoy_session = os.buoy.session
  .use(authMiddleware)
  .handler(async ({ context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const orgId = session.session.activeOrganizationId;
    var result = await prisma.buoy.findMany({
      where: {
        orgId,
      },
    });
    return result;
  });

export const buoy_update = os.buoy.update
  .use(authMiddleware)
  .handler(async ({ context, input }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const orgId = session.session.activeOrganizationId;
    const updatedBuoy = await prisma.buoy.update({
      where: {
        id: input.id,
      },
      data: {
        name: input.name,
        isMoveable: input.isMoveable,
        lat: input.lat,
        lon: input.lon,
      },
    });
    return updatedBuoy;
  });

export const buoy_delete = os.buoy.delete
  .use(authMiddleware)
  .handler(async ({ context, input }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const orgId = session.session.activeOrganizationId;
    const deletedBuoy = await prisma.buoy.delete({
      where: {
        id: input.boatId,
      },
    });
    return deletedBuoy;
  });
