// contract.ts
import { oc } from "@orpc/contract";
import { z } from "zod";
import { NextRaceSchema } from "@sailviz/types";
const helloSchema = z.object({
  name: z.string(),
  message: z.string(),
});

export const ORPCcontract = {
  hello: oc
    .input(z.object({ name: z.string().optional() }).optional())
    .output(helloSchema),
  getGlobalLaps: oc.output(z.number()),
  todaysRaces: oc
    .input(z.object({ clubId: z.string() }))
    .output(NextRaceSchema.array()),
};
