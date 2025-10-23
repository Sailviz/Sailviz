// contract.ts
import { oc } from "@orpc/contract";
import { z } from "zod";
import {
  BoatSchema,
  ClubSchema,
  ClubType,
  FleetSchema,
  FleetSettingsSchema,
  FleetSettingsType,
  GlobalConfigSchema,
  RaceSchema,
  RaceType,
  ResultSchema,
  ResultType,
  RoleSchema,
  SeriesSchema,
  SeriesType,
  StartSequenceStepSchema,
  UserSchema,
} from "@sailviz/types";
import { create } from "domain";

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
  startSequence: {
    find: oc
      .input(z.object({ seriesId: z.string() }))
      .output(z.array(StartSequenceStepSchema)),
    delete: oc
      .input(z.object({ stepId: z.string() }))
      .output(StartSequenceStepSchema),
    update: oc
      .input(
        z.object({
          seriesId: z.string(),
          startSequence: z.array(StartSequenceStepSchema),
        })
      )
      .output(z.array(StartSequenceStepSchema)),
  },
  series: {
    find: oc.input(z.object({ seriesId: z.string() })).output(SeriesSchema),
    club: oc
      .input(z.object({ clubId: z.string(), includeRaces: z.boolean() }))
      .output(z.array(SeriesSchema)),
    create: oc
      .input(z.object({ clubId: z.string(), name: z.string() }))
      .output(SeriesSchema),
    delete: oc.input(z.object({ seriesId: z.string() })).output(SeriesSchema),
    update: oc.input(SeriesSchema).output(SeriesSchema),
  },
  club: {
    session: oc.output<typeof ClubSchema>(ClubSchema),
    update: oc.input(ClubSchema).output(ClubSchema),
    all: oc.output(z.array(ClubSchema)),
    create: oc.input(z.object({ name: z.string() })).output(ClubSchema),
    find: oc.input(z.object({ clubId: z.string() })).output(ClubSchema),
    name: oc.input(z.object({ clubName: z.string() })).output(ClubSchema),
  },
  fleet: {
    find: oc
      .input(z.object({ fleetId: z.string() }))
      .output<typeof FleetSchema>(FleetSchema),
    settings: {
      create: oc.input(z.object({ seriesId: z.string() })).output(z.any()),
      find: oc.input(z.object({ seriesId: z.string() })).output(z.any()),
      delete: oc
        .input(z.object({ fleetSettingsId: z.string() }))
        .output(z.any()),
      update: oc.input(FleetSettingsSchema).output(FleetSettingsSchema),
    },
  },
  boat: {
    find: oc.input(z.object({ boatId: z.string() })).output(BoatSchema),
    session: oc.output(z.array(BoatSchema)),
    update: oc.input(BoatSchema).output(BoatSchema),
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
      .output(BoatSchema),
    delete: oc.input(z.object({ boatId: z.string() })).output(BoatSchema),
  },
  race: {
    find: oc.input(z.object({ raceId: z.string() })).output(RaceSchema),
    today: oc
      .input(z.object({ clubId: z.string() }))
      .output(z.array(RaceSchema)),
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
    update: oc.input(RaceSchema).output(RaceSchema),
    delete: oc.input(z.object({ raceId: z.string() })).output(RaceSchema),
    create: oc
      .input(
        z.object({
          seriesId: z.string(),
        })
      )
      .output(RaceSchema),
  },
  result: {
    create: oc.input(z.object({ fleetId: z.string() })).output(ResultSchema),
    update: oc.input(ResultSchema).output(ResultSchema),
  },
  user: {
    update: oc.input(UserSchema).output(UserSchema),
    create: oc.input(z.object({ clubId: z.string() })).output(UserSchema),
    club: oc
      .input(z.object({ clubId: z.string() }))
      .output(z.array(UserSchema)),
    delete: oc.input(UserSchema).output(UserSchema),
  },
  role: {
    create: oc.input(z.object({ clubId: z.string() })).output(RoleSchema),
    club: oc
      .input(z.object({ clubId: z.string() }))
      .output(z.array(RoleSchema)),
    update: oc.input(RoleSchema).output(RoleSchema),
    delete: oc.input(RoleSchema).output(RoleSchema),
  },
  globalConfig: {
    find: oc.output(GlobalConfigSchema),
  },
} as const;
