import prisma from "@sailviz/db";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../config";

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
