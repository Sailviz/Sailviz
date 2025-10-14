// contract.ts
import { oc } from "@orpc/contract";
import { date, z } from "zod";
import {
  BoatSchema,
  ClubSchema,
  ClubType,
  FleetSchema,
  NextRaceSchema,
  RaceSchema,
  SeriesSchema,
} from "@sailviz/types";

const helloSchema = z.object({
  name: z.string(),
  message: z.string(),
});

export const ORPCcontract = {
  hello: oc
    .input(z.object({ name: z.string().optional() }).optional())
    .output(helloSchema),
  laps: {
    global: oc.output(z.number()),
  },
  series: {
    club: oc
      .input(z.object({ clubId: z.string() }))
      .output(SeriesSchema.array()),
  },
  club: {
    session: oc.output<typeof ClubSchema>(ClubSchema),
    update: oc.input(ClubSchema).output(ClubSchema),
  },
  fleet: {
    find: oc
      .input(z.object({ fleetId: z.string() }))
      .output<typeof FleetSchema>(FleetSchema),
  },
  boat: {
    find: oc.input(z.object({ boatId: z.string() })).output(BoatSchema),
    session: oc.output(z.array(BoatSchema)),
    update: oc.input(BoatSchema).output(BoatSchema),
  },
  race: {
    find: oc
      .input(z.object({ raceId: z.string() }))
      .output<typeof RaceSchema>(RaceSchema),
    today: oc
      .input(z.object({ clubId: z.string() }))
      .output(NextRaceSchema.array()),
    club: oc
      .input(
        z.object({
          clubId: z.string(),
          page: z.number(),
          date: z.string(),
          historical: z.boolean(),
        })
      )
      .output(z.object({ races: z.array(RaceSchema), count: z.number() })),
  },
};
