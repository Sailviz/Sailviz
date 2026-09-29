import prisma from "@sailviz/db";
import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "../../contract";
import { authMiddleware } from "../../middleware";
import * as Types from "@sailviz/types";
const os = implement(ORPCcontract);

export const activity_like_create = os.activity.like.create
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any; // this is because the session type is not quite correct
    const userId = session?.user.id;
    if (!userId) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "User not authenticated",
      });
    }
    //create database entry
    const like = await prisma.activityLike.create({
      data: {
        activityId: input.activityId,
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    return like;
  });
