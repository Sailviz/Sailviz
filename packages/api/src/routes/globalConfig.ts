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

export const globalConfig_update = os.globalConfig.update.handler(
  async ({ input }) => {
    const updatedConfig = await prisma.globalConfig.updateMany({
      where: { active: true },
      data: {
        demoClubId: input.demoClubId,
        demoSeriesId: input.demoSeriesId,
        demoDataId: input.demoDataId,
        demoUUID: input.demoUUID,
      },
    });
    if (updatedConfig) {
      return updatedConfig[0];
    } else {
      throw new ORPCError("BAD_REQUEST");
    }
  }
);
