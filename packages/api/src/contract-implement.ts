import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "./contract";
import prisma from "@sailviz/db";
const os = implement(ORPCcontract);

const hello = os.hello.handler(({ input }) => {
  // input is optional in the contract; guard against undefined here.
  console.log("Input received:", input);

  const name = input?.name ?? "World";

  return { name, message: `Hello, ${name}!` };
});

const getGlobalLaps = os.getGlobalLaps.handler(async ({ context }) => {
  var laps = await prisma.lap.count({});
  console.log(laps);
  if (laps) {
    return laps;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});

export const mainRouter = os.router({
  hello,
  getGlobalLaps,
});
