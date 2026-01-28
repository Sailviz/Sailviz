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
      metadata: JSON.stringify({
        duties: [
          "Race Officer",
          "Assistant Race Officer",
          "Safety Officer",
          "Assistant Safety Officer",
          "Duty Officer",
        ],
        hornIP: "",
        clockIP: "",
        trackable: { orgID: "", enabled: false },
        clockOffset: 1,
        pursuitLength: 60,
      }),
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
