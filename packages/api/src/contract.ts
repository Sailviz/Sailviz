// contract.ts
import { oc } from "@orpc/contract";
import { z } from "zod";
import * as Types from "@sailviz/types";

const helloSchema = z.object({
  name: z.string(),
  message: z.string(),
});

export const ORPCcontract = {
  hello: oc
    .input(z.object({ name: z.string().optional() }).optional())
    .output(helloSchema),
  lap: {
    global: oc.output(z.number()),
    create: oc
      .input(z.object({ resultId: z.string(), time: z.number() }))
      .output(Types.LapSchema),
    delete: oc.input(z.object({ lapId: z.string() })).output(Types.LapSchema),
  },
  startSequence: {
    find: oc
      .input(z.object({ seriesId: z.string() }))
      .output(z.array(Types.StartSequenceStepSchema)),
    delete: oc
      .input(z.object({ stepId: z.string() }))
      .output(Types.StartSequenceStepSchema),
    update: oc
      .input(
        z.object({
          seriesId: z.string(),
          startSequence: z.array(Types.StartSequenceStepSchema),
        })
      )
      .output(z.array(Types.StartSequenceStepSchema)),
  },
  series: {
    find: oc
      .input(z.object({ seriesId: z.string() }))
      .output(Types.SeriesSchema),
    club: oc
      .input(z.object({ clubId: z.string(), includeRaces: z.boolean() }))
      .output(z.array(Types.SeriesSchema)),
    create: oc
      .input(z.object({ clubId: z.string(), name: z.string() }))
      .output(Types.SeriesSchema),
    delete: oc
      .input(z.object({ seriesId: z.string() }))
      .output(Types.SeriesSchema),
    update: oc.input(Types.SeriesSchema).output(Types.SeriesSchema),
  },
  club: {
    session: oc.output<typeof Types.ClubSchema>(Types.ClubSchema),
    update: oc.input(Types.ClubSchema).output(Types.ClubSchema),
    all: oc.output(z.array(Types.ClubSchema)),
    create: oc.input(z.object({ name: z.string() })).output(Types.ClubSchema),
    find: oc.input(z.object({ clubId: z.string() })).output(Types.ClubSchema),
    name: oc.input(z.object({ clubName: z.string() })).output(Types.ClubSchema),
    findByStripeCustomerId: oc
      .input(z.object({ stripeCustomerId: z.string() }))
      .output(Types.ClubSchema),
  },
  fleet: {
    find: oc
      .input(z.object({ fleetId: z.string() }))
      .output<typeof Types.FleetSchema>(Types.FleetSchema),
    update: oc.input(Types.FleetSchema).output(Types.FleetSchema),
    settings: {
      create: oc.input(z.object({ seriesId: z.string() })).output(z.any()),
      find: oc.input(z.object({ seriesId: z.string() })).output(z.any()),
      delete: oc
        .input(z.object({ fleetSettingsId: z.string() }))
        .output(z.any()),
      update: oc
        .input(Types.FleetSettingsSchema)
        .output(Types.FleetSettingsSchema),
    },
  },
  boat: {
    find: oc.input(z.object({ boatId: z.string() })).output(Types.BoatSchema),
    session: oc.output(z.array(Types.BoatSchema)),
    update: oc.input(Types.BoatSchema).output(Types.BoatSchema),
    create: oc
      .input(
        z.object({
          name: z.string(),
          crew: z.number(),
          py: z.number(),
          pursuitStartTime: z.number(),
          clubId: z.string(),
        })
      )
      .output(Types.BoatSchema),
    delete: oc.input(z.object({ boatId: z.string() })).output(Types.BoatSchema),
  },
  race: {
    find: oc.input(z.object({ raceId: z.string() })).output(Types.RaceSchema),
    today: oc
      .input(z.object({ clubId: z.string() }))
      .output(z.array(Types.RaceSchema)),
    club: oc
      .input(
        z.object({
          clubId: z.string(),
          page: z.number(),
          date: z.string(),
          historical: z.boolean(),
        })
      )
      .output(
        z.object({ races: z.array(Types.RaceSchema), count: z.number() })
      ),
    update: oc
      .input(
        z.object({
          id: z.string(),
          number: z.number().optional(),
          Time: z.string().optional(),
          Duties: Types.DutySchema.optional(),
          Type: z.string().optional(),
        })
      )
      .output(Types.RaceSchema),
    delete: oc.input(z.object({ id: z.string() })).output(Types.RaceSchema),
    create: oc
      .input(
        z.object({
          seriesId: z.string(),
        })
      )
      .output(Types.RaceSchema),
  },
  result: {
    create: oc
      .input(z.object({ fleetId: z.string() }))
      .output(Types.ResultSchema),
    update: oc.input(Types.ResultSchema).output(Types.ResultSchema),
    delete: oc.input(z.object({ id: z.string() })).output(Types.ResultSchema),
  },
  user: {
    update: oc.input(Types.UserSchema).output(Types.UserSchema),
    create: oc.input(z.object({ clubId: z.string() })).output(Types.UserSchema),
    club: oc
      .input(z.object({ clubId: z.string() }))
      .output(z.array(Types.UserSchema)),
    delete: oc.input(Types.UserSchema).output(Types.UserSchema),
  },
  role: {
    create: oc.input(z.object({ clubId: z.string() })).output(Types.RoleSchema),
    club: oc
      .input(z.object({ clubId: z.string() }))
      .output(z.array(Types.RoleSchema)),
    update: oc.input(Types.RoleSchema).output(Types.RoleSchema),
    delete: oc.input(Types.RoleSchema).output(Types.RoleSchema),
  },
  globalConfig: {
    find: oc.output(Types.GlobalConfigSchema),
    update: oc.input(Types.GlobalConfigSchema).output(Types.GlobalConfigSchema),
  },
} as const;
