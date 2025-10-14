// contract.ts
import { oc } from "@orpc/contract";
import { date, z } from "zod";
import {
  FleetSchema,
  NextRaceSchema,
  RaceSchema,
  SeriesSchema,
} from "@sailviz/types";
import { count } from "console";
import { Fleet } from "packages/db/src/generated";
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
  racebyClubId: oc
    .input(
      z.object({
        clubId: z.string(),
        page: z.number(),
        date: z.string(),
        historical: z.boolean(),
      })
    )
    .output(z.object({ races: z.array(RaceSchema), count: z.number() })),
  seriesbyClubId: oc
    .input(z.object({ clubId: z.string() }))
    .output(SeriesSchema.array()),
  racebyId: oc.input(z.object({ raceId: z.string() })).output(RaceSchema),
  boats: oc.output(z.array(z.any())), //need to define BoatSchema
  fleetbyId: oc
    .input(z.object({ fleetId: z.string() }))
    .output<typeof FleetSchema>(FleetSchema),
};
