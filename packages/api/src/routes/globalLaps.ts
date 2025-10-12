import { os, ORPCError } from "@orpc/server";
import prisma from "@sailviz/db";

export const getGlobalLaps = os.handler(async ({ context }) => {
  var laps = await prisma.lap.count({});
  console.log(laps);
  if (laps) {
    return laps;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});
