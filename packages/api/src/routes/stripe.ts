import prisma from "@sailviz/db";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../config";
import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "../contract";
import { StartSequenceStepType } from "packages/types/src/types";

const os = implement(ORPCcontract);

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover",
});
export async function createStripeCustomer(orgId: string) {
  const org = await prisma.organization.findUnique({
    where: {
      id: orgId,
    },
  });

  if (!org) {
    throw new Error("Club not found");
  }

  const customer = await stripe.customers.create({
    name: org.name,
    email: org.name + "_admin@sailviz.com", // Placeholder email, should be replaced with actual admin email
    metadata: {
      orgId: org.id,
    },
  });

  await prisma.organization.update({
    where: {
      id: org.id,
    },
    data: {
      stripe: {
        create: {
          customerId: customer.id,
          subscriptionId: null,
          productId: null,
          planName: null,
          subscriptionStatus: "inactive",
          updatedAt: new Date().toISOString(),
        },
      },
    },
  });

  return customer;
}

export const stripe_find = os.stripe.find.handler(async ({ input }) => {
  const stripe = await prisma.stripe.findUnique({
    where: { customerId: input.stripeCustomerId },
  });
  if (!stripe) {
    throw new ORPCError("NOT_FOUND", { message: "Stripe data not found" });
  }
  return stripe;
});

export const stripe_update = os.stripe.update.handler(async ({ input }) => {
  const updatedStripe = await prisma.stripe.update({
    where: { customerId: input.customerId },
    data: {
      subscriptionId: input.subscriptionId,
      productId: input.productId,
      planName: input.planName,
      subscriptionStatus: input.subscriptionStatus,
      updatedAt: new Date().toISOString(),
    },
  });
  if (!updatedStripe) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Could not update stripe data",
    });
  }
  return updatedStripe;
});

export const stripe_org = os.stripe.org.handler(async ({ input }) => {
  const org = await prisma.organization.findUnique({
    where: { id: input.orgId },
    include: { stripe: true },
  });
  console.log("Fetched org for stripe_org:", org);
  if (!org || !org.stripe) {
    throw new ORPCError("NOT_FOUND", {
      message: "Organization or Stripe data not found",
    });
  }
  return org.stripe;
});
