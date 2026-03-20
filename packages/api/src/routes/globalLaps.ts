import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "../contract";
import prisma from "@sailviz/db";
const os = implement(ORPCcontract);

export const lap_global = os.lap.global.handler(async ({ context }) => {
  var laps = await prisma.lap.count({});
  console.log(laps);
  if (laps) {
    return laps;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});
