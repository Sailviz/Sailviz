import prisma from "@sailviz/db";
import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "../../contract";
import { authMiddleware } from "../../middleware";
import * as Types from "@sailviz/types";
const os = implement(ORPCcontract);

export const follow_create = os.social.follow.create
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any; // this is because the session type is not quite correct
    const userId = session?.user.id;
    if (!userId) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "User not authenticated",
      });
    }
    if (userId === input.followingId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "User cannot follow themselves",
      });
    }
    //create database entry
    const follow = await prisma.follow.create({
      data: {
        followerId: userId,
        followingId: input.followingId,
      },
    });
    return follow;
  });

export const follow_delete = os.social.follow.delete
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any; // this is because the session type is not quite correct
    const userId = session?.user.id;
    if (!userId) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "User not authenticated",
      });
    }
    //delete database entry
    const follow = await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: input.followerId,
          followingId: input.followingId,
        },
      },
    });
    return follow;
  });

export const follow_getFollowers = os.social.follow.getFollowers
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any; // this is because the session type is not quite correct
    const userId = session?.user.id;
    if (!userId) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "User not authenticated",
      });
    }
    //get followers from database
    const followers = await prisma.follow.findMany({
      where: {
        followingId: input.userId,
      },
      include: {
        follower: true,
      },
    });
    //convert to array of ReducedUserType
    const reducedFollowers: Types.ReducedUserType[] = followers.map((f) => {
      return {
        id: f.follower.id,
        name: f.follower.name,
        image: f.follower.image,
      };
    });
    return reducedFollowers;
  });

export const follow_getFollowing = os.social.follow.getFollowing
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any; // this is because the session type is not quite correct
    const userId = session?.user.id;
    if (!userId) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "User not authenticated",
      });
    }
    //get following from database
    const following = await prisma.follow.findMany({
      where: {
        followerId: input.userId,
      },
      include: {
        following: true,
      },
    });
    //convert to array of ReducedUserType
    const reducedFollowing: Types.ReducedUserType[] = following.map((f) => {
      return {
        id: f.following.id,
        name: f.following.name,
        image: f.following.image,
      };
    });
    return reducedFollowing;
  });
