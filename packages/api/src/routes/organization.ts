import prisma from "@sailviz/db";
import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "../contract";
import { createStripeCustomer } from "./stripe";
import * as Types from "@sailviz/types";
import { authMiddleware } from "../middleware";

const os = implement(ORPCcontract);

export async function getOrg(orgId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    omit: {
      stripeCustomerId: true,
      createdAt: true,
    },
  });
  return org as unknown as Types.Org; //have to do unknown as settings isn't typed in db
}

export async function updateOrgById(input: any) {
  const org = await prisma.organization.update({
    where: { id: input.id },
    data: input,
  });
  return org as unknown as Types.Org;
}

export const org_all = os.organization.all.handler(async ({ input }) => {
  const orgs = await prisma.organization.findMany({
    omit: {
      stripeCustomerId: true,
      createdAt: true,
    },
  });
  console.log(orgs);
  const filteredOrgs = orgs.filter((org) => org.id != "admin-id");
  return filteredOrgs as unknown as Types.Org[];
});

export const org_create = os.organization.create.handler(async ({ input }) => {
  //create a new org with default settings
  const newOrg = await prisma.organization.create({
    data: {
      name: input.name,
      createdAt: new Date(),
      slug: input.name,
      metadata: "",
    },
  });

  //create stripe customer
  createStripeCustomer(newOrg.id);

  if (newOrg) {
    return newOrg as unknown as Types.Org;
  } else {
    throw new ORPCError("Org not created");
  }
});

export const org_find = os.organization.find.handler(async ({ input }) => {
  const org = await prisma.organization.findUnique({
    where: { id: input.orgId },
  });
  if (org) {
    return org as unknown as Types.Org;
  } else {
    throw new ORPCError("Org not found");
  }
});

export const org_name = os.organization.name.handler(async ({ input }) => {
  const org = await prisma.organization.findUnique({
    where: { name: input.orgName },
    omit: {
      stripeCustomerId: true,
    },
  });
  if (org) {
    return org as unknown as Types.Org;
  } else {
    throw new ORPCError("Org not found");
  }
});

export const org_findByStripeCustomerId =
  os.organization.findByStripeCustomerId.handler(async ({ input }) => {
    const org = await prisma.organization.findFirst({
      where: { stripeCustomerId: input.stripeCustomerId },
    });
    if (org) {
      return org as unknown as Types.Org;
    } else {
      throw new ORPCError("Org not found");
    }
  });

export const org_session = os.organization.session
  .use(authMiddleware)
  .handler(async ({ context }) => {
    const session = context.session as any; // this is because the session type is not quite correct
    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const orgId = session.session.activeOrganizationId;
    const club = await getOrg(orgId);
    if (!club) {
      throw new ORPCError("NOT_FOUND");
    }
    console.log("org session", club);
    return club;
  });

export const org_update = os.organization.update
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const updatedClub = updateOrgById(input);
    if (!updatedClub) {
      throw new ORPCError("BAD_REQUEST", { message: "Could not update club" });
    }
    return updatedClub;
  });

// ORG DATA
export const orgData_update = os.organization.orgData.update.handler(
  async ({ input }) => {
    const updatedOrgData = await prisma.orgData.update({
      where: {
        id: input.id,
      },
      data: {
        defaultPursuitLength: input.defaultPursuitLength,
        trackableOrgId: input.trackableOrgId,
      },
      include: {
        duties: true,
      },
    });
    if (!updatedOrgData) {
      throw new ORPCError("Failed to update organization data");
    }
    return updatedOrgData;
  },
);

// DUTIES

export const duty_create = os.organization.duties.create
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    console.log("Creating duty with input:", input);
    const session = context.session as any;
    console.log("Session in duty_create:", session);
    const org = await prisma.organization.findUnique({
      where: { id: session.session.activeOrganizationId! },
    });
    console.log("orgDataId", org);
    const newDuty = await prisma.duties.create({
      data: {
        orgData: {
          connect: {
            id: org?.orgDataId!,
          },
        },
        name: "Duty",
      },
    });
    if (!newDuty) {
      throw new ORPCError("Failed to create duty");
    }
    return newDuty;
  });

export const duty_update = os.organization.duties.update.handler(
  async ({ input }) => {
    const updatedDuty = await prisma.duties.update({
      where: {
        id: input.id,
      },
      data: {
        name: input.name,
      },
    });
    if (!updatedDuty) {
      throw new ORPCError("Failed to update duty");
    }
    return updatedDuty;
  },
);

export const buoy_session = os.organization.buoys.session
  .use(authMiddleware)
  .handler(async ({ context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const orgId = session.session.activeOrganizationId;
    const buoys = await prisma.buoy.findMany({
      where: { orgId: orgId },
    });
    return buoys as unknown as Types.BuoyType[];
  });
