import prisma from "@sailviz/db";
import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "../contract";
import { authMiddleware } from "../middleware";
import * as Types from "@sailviz/types";
const os = implement(ORPCcontract);

export async function findFlags(orgId: string) {
  // Fetch standard flags from the database
  var standardFlags = await prisma.flag.findMany({});
  var customFlags = await prisma.customFlag.findMany({
    where: {
      orgId: orgId,
    },
    omit: { orgId: true },
  });
  // Combine standard and custom flags
  const result = [...standardFlags, ...customFlags];
  return result;
}

export async function findFlag(flagId: string): Promise<Types.Flag> {
  var standard = await prisma.flag.findUnique({
    where: {
      id: flagId,
    },
  });
  if (!standard) {
    // probably a custom flag, check that
    var custom = await prisma.customFlag.findUnique({
      where: {
        id: flagId,
      },
    });
    if (!custom) {
      throw new ORPCError("NOT_FOUND", {
        message: "Flag not found",
      });
    }
    return custom;
  }
  return standard;
}

export const flag_create = os.flag.standard.create.handler(
  async ({ input }) => {
    const newFlag = await prisma.flag.create({
      data: {
        name: input.name,
        s3key: input.s3key,
      },
    });
    if (newFlag) {
      return newFlag;
    } else {
      throw new ORPCError("Flag not created");
    }
  },
);

export const flag_delete = os.flag.standard.delete.handler(
  async ({ input }) => {
    const deletedFlag = await prisma.flag.delete({
      where: { id: input.flagId },
    });
    if (deletedFlag) {
      return deletedFlag;
    } else {
      throw new ORPCError("BAD_REQUEST");
    }
  },
);

export const flag_update = os.flag.standard.update
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const updatedFlag = await prisma.flag.update({
      where: { id: input.id },
      data: input,
    });
    if (!updatedFlag) {
      throw new ORPCError("BAD_REQUEST", { message: "Could not update flag" });
    }
    return updatedFlag;
  });

export const flag_find = os.flag.standard.find
  .use(authMiddleware)
  .handler(async ({ input }) => {
    const flag = await prisma.flag.findUnique({
      where: {
        id: input.flagId,
      },
    });
    if (flag) {
      return flag;
    } else {
      throw new ORPCError("NOT_FOUND");
    }
  });

export const flag_org_custom = os.flag.org.custom
  .use(authMiddleware)
  .handler(async ({ context }) => {
    const session = context.session as any; // this is because the session type is not quite correct
    const orgId = session?.session.activeOrganizationId;
    if (!orgId) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const flagsList = await prisma.customFlag.findMany({
      where: {
        orgId: orgId,
      },
      orderBy: {
        name: "asc",
      },
    });
    if (flagsList) {
      return flagsList;
    } else {
      throw new ORPCError("NOT_FOUND");
    }
  });

export const flag_org_all = os.flag.org.all.handler(async ({ input }) => {
  const flagsList = await findFlags(input.orgId);
  if (flagsList) {
    return flagsList;
  } else {
    throw new ORPCError("NOT_FOUND");
  }
});

export const flag_standard_all = os.flag.standard.all.handler(async () => {
  const flagsList = await prisma.flag.findMany({
    orderBy: {
      name: "asc",
    },
  });
  if (flagsList) {
    return flagsList;
  } else {
    throw new ORPCError("NOT_FOUND");
  }
});

export const flag_custom_update = os.flag.org.update
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    const clubId = session?.session.activeOrganizationId as string;
    const flagToUpdate = await prisma.customFlag.findFirst({
      where: {
        flagId: input.id,
        orgId: clubId,
      },
    });
    if (flagToUpdate) {
      await prisma.customFlag.update({
        where: {
          id: flagToUpdate.id,
        },
        data: {
          name: input.name,
          s3key: input.s3key,
        },
      });
    } else {
      throw new ORPCError("NOT_FOUND", {
        message: "No flag found to update",
      });
    }
    const flag = await findFlag(input.id);
    if (flag) {
      return flag;
    } else {
      throw new ORPCError("NOT_FOUND");
    }
  });

export const flag_custom_delete = os.flag.org.delete
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    const clubId = session?.session.activeOrganizationId as string;
    const flagToDelete = await prisma.customFlag.findFirst({
      where: {
        flagId: input.flagId,
        orgId: clubId,
      },
    });
    if (!flagToDelete) {
      throw new ORPCError("NOT_FOUND", {
        message: "No customisation found for this flag",
      });
    }
    await prisma.customFlag.delete({
      where: {
        id: flagToDelete.id,
      },
    });
    return flagToDelete;
  });

export const flag_custom_create = os.flag.org.create
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    const clubId = session?.session.activeOrganizationId as string;
    const newFlag = await prisma.customFlag.create({
      data: {
        name: input.name,
        s3key: input.s3key,
        orgId: clubId,
      },
    });
    if (newFlag) {
      return newFlag;
    } else {
      throw new ORPCError("Flag not created");
    }
  });
