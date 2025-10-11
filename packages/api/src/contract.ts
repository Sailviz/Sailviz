// contract.ts
import { oc } from "@orpc/contract";
import { z } from "zod";

const helloSchema = z.object({
  name: z.string(),
  message: z.string(),
});

export const ORPCcontract = {
  hello: oc
    .input(z.object({ name: z.string().optional() }).optional())
    .output(helloSchema),
  getGlobalLaps: oc.output(z.number()),
};
