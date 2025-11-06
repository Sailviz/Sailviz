import prisma from "@sailviz/db";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../config";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
});
export async function createStripeCustomer(clubId: string) {
  const club = await prisma.club.findUnique({
    where: {
      id: clubId,
    },
  });

  if (!club) {
    throw new Error("Club not found");
  }

  const customer = await stripe.customers.create({
    name: club.name,
    email: club.name + "_admin@sailviz.com", // Placeholder email, should be replaced with actual admin email
    metadata: {
      clubId: club.id,
    },
  });

  await prisma.club.update({
    where: {
      id: club.id,
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
