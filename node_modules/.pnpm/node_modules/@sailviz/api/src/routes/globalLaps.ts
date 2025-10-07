import { os, ORPCError } from "@orpc/server";
import prisma from "@sailviz/db";

async function getLaps() {
  var result = await prisma.lap.count({});

  console.log("Result:", result);
  if (result == null) {
    return;
  }
  return result;
}

export const getGlobalLaps = os
  .$context<{ headers: Record<string, string | string[] | undefined> }>()
  .handler(async ({ context }) => {
    console.log("Headers:", context.headers);
    var laps = await getLaps();
    console.log(laps);
    if (laps) {
      return laps;
    } else {
      throw new ORPCError("BAD_REQUEST");
    }
  });
