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
      profile: {},
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

export const user_profile_addFavourite = os.user.profile.addFavourite
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const userProfileId = session.user.profile.id;
    const orgId = input.orgId;
    const existingFavourite = await prisma.userFavouriteOrgs.findFirst({
      where: {
        userProfileId,
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
        userProfileId,
        orgId,
      },
    });
  });

export const user_profile_removeFavourite = os.user.profile.removeFavourite
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const userProfileId = session.user.profile.id;
    const orgId = input.orgId;
    const existingFavourite = await prisma.userFavouriteOrgs.findFirst({
      where: {
        userProfileId,
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

export const user_profile_find = os.user.profile.find
  .use(authMiddleware)
  .handler(async ({ context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const userProfileId = session.user.profile.id;
    const userProfile = await prisma.userProfile.findUnique({
      where: {
        id: userProfileId,
      },
      include: {
        userFavouriteOrgs: true,
        signOnProfiles: true,
      },
    });
    if (!userProfile) {
      throw new ORPCError("NOT_FOUND", { message: "User profile not found." });
    }

    return userProfile as Types.UserProfile;
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
    return results;
  });
