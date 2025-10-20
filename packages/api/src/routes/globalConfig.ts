import prisma from "@sailviz/db";
import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "../contract";
const os = implement(ORPCcontract);

export const globalConfig_find = os.globalConfig.find.handler(async () => {
  const result = await prisma.globalConfig.findFirst();
  if (result) {
    return result;
  } else {
    throw new ORPCError("Global config not found");
  }
});
