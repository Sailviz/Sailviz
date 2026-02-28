import prisma from "@sailviz/db";
import * as Types from "@sailviz/types";

const { implement, ORPCError } = require("@orpc/server");
import { ORPCcontract } from "../contract";
import { authMiddleware } from "../middleware";
const os = implement(ORPCcontract);

export async function updateUserById(
  user: Types.UserType,
): Promise<Types.UserType> {
  const { id, ...updateData } = user;
  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData as any,
  });
  return updatedUser;
}

async function createUser(): Promise<Types.UserType> {
  const newUser = await prisma.user.create({
    data: {
      name: "",
      email: null,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      startPage: "dashboard",
    },
  });
  return newUser as Types.UserType;
}

export async function deleteUserById(userId: string): Promise<Types.UserType> {
  const deletedUser = await prisma.user.delete({
    where: { id: userId },
  });
  return deletedUser as Types.UserType;
}

export const user_create = os.user.create
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const newUser = await createUser();
    if (!newUser) {
      throw new ORPCError("BAD_REQUEST", { message: "Could not create user" });
    }
    return newUser;
  });

export const user_update = os.user.update
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const updatedUser = await updateUserById(input);
    if (!updatedUser) {
      throw new ORPCError("BAD_REQUEST", { message: "Could not update user" });
    }
    return updatedUser;
  });

export const user_delete = os.user.delete
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const deletedUser = await deleteUserById(input.id);
    if (!deletedUser) {
      throw new ORPCError("BAD_REQUEST", { message: "Could not delete user" });
    }
    return deletedUser;
  });

export const user_addFavourite = os.user.addFavourite
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const userId = session.user.id;
    const orgId = input.orgId;
    const existingFavourite = await prisma.userFavouriteOrgs.findFirst({
      where: {
        userId,
        orgId,
      },
    });
    if (existingFavourite) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Favourite already exists.",
      });
    }
    await prisma.userFavouriteOrgs.create({
      data: {
        userId,
        orgId,
      },
    });
  });

export const user_removeFavourite = os.user.removeFavourite
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const userId = session.user.id;
    const orgId = input.orgId;
    const existingFavourite = await prisma.userFavouriteOrgs.findFirst({
      where: {
        userId,
        orgId,
      },
    });
    if (!existingFavourite) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Favourite does not exist.",
      });
    }
    await prisma.userFavouriteOrgs.delete({
      where: {
        id: existingFavourite.id,
      },
    });
  });

export const user_results_all = os.user.results.all
  .use(authMiddleware)
  .handler(async ({ context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const userId = session.user.id;
    const results = await prisma.result.findMany({
      where: {
        userId,
      },
    });
    console.log("User results:", results);
    const fleets = await prisma.fleet.findMany({
      where: {
        id: {
          in: results.map((result) => result.fleetId),
        },
      },
    });
    console.log("Fleets for user results:", fleets);
    const races = await prisma.race.findMany({
      where: {
        id: {
          in: fleets.map((fleet) => fleet.raceId),
        },
      },
      include: {
        fleets: {
          include: {
            fleetSettings: true,
          },
        },
        series: true,
      },
    });
    return races as Types.RaceType[];
  });

export const user_signOnProfile_create = os.user.signOnProfile.create
  .use(authMiddleware)
  .handler(async ({ context, input }) => {
    console.log("Creating sign-on profile with input:", input);
    const session = context.session as any;
    const userId = session.user.id;
    const newSignOnProfile = await prisma.signOnProfile.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        Helm: input.Helm,
        Crew: input.Crew,
        SailNumber: input.sailNumber,
        Boat: {
          connect: {
            id: input.boatId,
          },
        },
      },
      include: {
        Boat: true,
      },
    });
    if (!newSignOnProfile) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Could not create user profile",
      });
    }
    return newSignOnProfile as Types.SignOnProfile;
  });
export const user_signOnProfile_update = os.user.signOnProfile.update
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const updatedUserProfile = await prisma.signOnProfile.update({
      where: { id: input.id },
      data: {
        Helm: input.Helm,
        Crew: input.Crew,
        SailNumber: input.SailNumber,
        Boat: {
          connect: {
            id: input.Boat.id,
          },
        },
      },
      include: {
        Boat: true,
      },
    });
    if (!updatedUserProfile) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Could not update user profile",
      });
    }
    return updatedUserProfile as Types.SignOnProfile;
  });

export const user_signOnProfile_delete = os.user.signOnProfile.delete
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const deletedUserProfile = await prisma.signOnProfile.delete({
      where: { id: input.id },
      include: {
        Boat: true,
      },
    });
    if (!deletedUserProfile) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Could not delete user profile",
      });
    }
    return deletedUserProfile as Types.SignOnProfile;
  });

export const user_signOnProfile_all = os.user.signOnProfile.all
  .use(authMiddleware)
  .handler(async ({ context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const userId = session.user.id;
    const profiles = await prisma.signOnProfile.findMany({
      where: {
        userId,
      },
      include: {
        Boat: true,
      },
    });
    return profiles as Types.SignOnProfile[];
  });

export const user_favouriteOrgs = os.user.favouriteOrgs
  .use(authMiddleware)
  .handler(async ({ context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const userId = session.user.id;
    const favouriteOrgs = await prisma.userFavouriteOrgs.findMany({
      where: {
        userId,
      },
      include: {
        organization: true,
      },
    });
    return favouriteOrgs as Types.userFavouriteOrgsType[];
  });
