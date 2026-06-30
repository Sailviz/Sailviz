// contract.ts
import { oc } from "@orpc/contract";
import { z } from "zod";
import * as Types from "@sailviz/types";

export const ORPCcontract = {
  lap: {
    global: oc.output(z.number()),
    create: oc
      .input(z.object({ resultId: z.string(), time: z.number() }))
      .output(Types.LapSchema),
    delete: oc.input(z.object({ lapId: z.string() })).output(Types.LapSchema),
  },
  stripe: {
    find: oc
      .input(z.object({ stripeCustomerId: z.string() }))
      .output(Types.stripeSchema),
    update: oc.input(Types.stripeSchema).output(Types.stripeSchema),
    org: oc.input(z.object({ orgId: z.string() })).output(Types.stripeSchema),
  },
  buoy: {
    session: oc.output(z.array(Types.BuoySchema)),
    update: oc.input(Types.BuoySchema).output(Types.BuoySchema),
    delete: oc.input(z.object({ boatId: z.string() })).output(Types.BuoySchema),
    create: oc
      .input(
        z.object({
          name: z.string(),
          isMoveable: z.boolean(),
          isStartLine: z.boolean(),
        }),
      )
      .output(Types.BuoySchema),
  },
  series: {
    find: oc
      .input(z.object({ seriesId: z.string() }))
      .output(Types.SeriesSchema),
    club: oc
      .input(
        z.object({
          orgId: z.string(),
          page: z.number(),
          pageSize: z.number(),
          search: z.string().nullable(),
          tags: z.string().nullable(),
        }),
      )
      .output(
        z.object({
          seriesCount: z.number(),
          series: z.array(Types.SeriesSchema),
        }),
      ),
    create: oc
      .input(
        z.object({
          orgId: z.string(),
          name: z.string(),
          startSequence: z.string().optional(),
        }),
      )
      .output(Types.SeriesSchema),
    delete: oc
      .input(z.object({ seriesId: z.string() }))
      .output(Types.SeriesSchema),
    update: oc
      .input(
        z.object({
          id: z.string(),
          settings: z.any().optional(),
          name: z.string().optional(),
          startSequence: z.string().optional(),
        }),
      )
      .output(Types.SeriesSchema),
    tags: {
      update: oc
        .input(
          z.object({
            seriesId: z.string(),
            orgId: z.string(),
            tags: z.string().array(),
          }),
        )
        .output(Types.SeriesSchema),
    },
  },
  organization: {
    session: oc.output<typeof Types.OrgSchema>(Types.OrgSchema),
    update: oc.input(Types.OrgSchema).output(Types.OrgSchema),
    all: oc.output(z.array(Types.OrgSchema)),
    create: oc.input(z.object({ name: z.string() })).output(Types.OrgSchema),
    find: oc.input(z.object({ orgId: z.string() })).output(Types.OrgSchema),
    name: oc.input(z.object({ orgName: z.string() })).output(Types.OrgSchema),
    findByStripeCustomerId: oc
      .input(z.object({ stripeCustomerId: z.string() }))
      .output(Types.OrgSchema),
    orgData: {
      update: oc.input(Types.OrgDataSchema).output(Types.OrgDataSchema),
    },
    duties: {
      create: oc.output(Types.DutySchema),
      update: oc.input(Types.DutySchema).output(Types.DutySchema),
    },
    buoys: {
      session: oc.output(z.array(Types.BuoySchema)),
    },
  },
  image: {
    createUploadUrl: oc
      .input(
        z.object({
          ownerType: z.enum(["user", "organisation", "public"]),
          ownerId: z.string().nullable(),
          category: z.enum(["flag", "banner", "logo"]),
        }),
      )
      .output(
        z.object({
          uploadUrl: z.string(),
          id: z.string(),
          key: z.string(),
        }),
      ),
    saveMetadata: oc
      .input(
        z.object({
          id: z.string(),
          s3key: z.string(),
          ownerType: z.enum(["user", "organisation", "public"]),
          ownerId: z.string().optional(),
          category: z.enum(["flag", "banner", "logo"]),
        }),
      )
      .output(z.any()),
    getURL: oc
      .input(
        z.object({
          s3key: z.string(),
        }),
      )
      .output(z.string()),
    orgBanner: oc
      .input(z.object({ orgId: z.string() }))
      .output(z.string().nullable()),
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
    standard: {
      all: oc.output(z.array(Types.StandardBoatSchema)),
      find: oc
        .input(z.object({ boatId: z.string() }))
        .output(Types.StandardBoatSchema),
      update: oc
        .input(Types.StandardBoatSchema)
        .output(Types.StandardBoatSchema),
      create: oc
        .input(
          z.object({
            name: z.string(),
            crew: z.number(),
            py: z.number(),
          }),
        )
        .output(Types.StandardBoatSchema),
      delete: oc
        .input(z.object({ boatId: z.string() }))
        .output(Types.StandardBoatSchema),
    },
    org: {
      session: oc.output(z.array(Types.BoatSchema)),
      all: oc
        .input(z.object({ orgId: z.string() }))
        .output(z.array(Types.BoatSchema)),
      update: oc.input(Types.BoatSchema).output(Types.BoatSchema),
      delete: oc
        .input(z.object({ boatId: z.string() }))
        .output(Types.BoatSchema),
    },
  },
  race: {
    find: oc.input(z.object({ raceId: z.string() })).output(Types.RaceSchema),
    today: oc
      .input(z.object({ orgId: z.string() }))
      .output(z.array(Types.RaceSchema)),
    org: oc
      .input(
        z.object({
          orgId: z.string(),
          page: z.number(),
          pageSize: z.number(),
          date: z.string(),
          historical: z.boolean(),
        }),
      )
      .output(
        z.object({ races: z.array(Types.RaceSchema), count: z.number() }),
      ),
    update: oc
      .input(
        z.object({
          id: z.string(),
          number: z.number().optional(),
          sequenceStartTime: z.number().optional(),
          Time: z.string().optional(),
          Duties: Types.DutySchema.optional(),
          Type: z.string().optional(),
          trackableEventId: z.string().nullable().optional(),
        }),
      )
      .output(Types.RaceSchema),
    delete: oc.input(z.object({ id: z.string() })).output(Types.RaceSchema),
    create: oc
      .input(
        z.object({
          seriesId: z.string(),
        }),
      )
      .output(Types.RaceSchema),
    course: {
      add: oc
        .input(
          z.object({
            buoyId: z.string(),
            order: z.number(),
            raceId: z.string(),
            side: z.string(),
          }),
        )
        .output(Types.courseBuoySchema),
      update: oc.input(Types.courseBuoySchema).output(Types.courseBuoySchema),
      delete: oc
        .input(z.object({ courseBuoyId: z.string() }))
        .output(Types.courseBuoySchema),
    },
  },
  result: {
    create: oc
      .input(
        z.object({
          fleetId: z.string(),
          helm: z.string(),
          crew: z.string(),
          boat: z.object({ id: z.string() }),
          sailNumber: z.string(),
        }),
      )
      .output(Types.ResultSchema),
    update: oc.input(Types.ResultSchema).output(Types.ResultSchema),
    delete: oc.input(z.object({ id: z.string() })).output(Types.ResultSchema),
  },
  user: {
    update: oc.input(Types.UserSchema).output(Types.UserSchema),
    create: oc.input(z.object({ orgId: z.string() })).output(Types.UserSchema),
    delete: oc.input(Types.UserSchema).output(Types.UserSchema),
    favouriteOrgs: oc.output(z.array(Types.userFavouriteOrgsSchema)),
    addFavourite: oc.input(z.object({ orgId: z.string() })),
    removeFavourite: oc.input(z.object({ orgId: z.string() })),
    signOnProfile: {
      all: oc.output(z.array(Types.signOnProfileSchema)),
      create: oc
        .input(
          z.object({
            Helm: z.string(),
            Crew: z.string(),
            sailNumber: z.string(),
            boatId: z.string(),
          }),
        )
        .output(Types.signOnProfileSchema),
      update: oc
        .input(Types.signOnProfileSchema)
        .output(Types.signOnProfileSchema),
      delete: oc
        .input(Types.signOnProfileSchema)
        .output(Types.signOnProfileSchema),
    },
    results: {
      all: oc.output(z.array(Types.RaceSchema)),
    },
  },
  globalConfig: {
    find: oc.output(Types.GlobalConfigSchema),
    update: oc.input(Types.GlobalConfigSchema).output(Types.GlobalConfigSchema),
  },
  flag: {
    standard: {
      all: oc.output(z.array(Types.flagSchema)),
      find: oc.input(z.object({ flagId: z.string() })).output(Types.flagSchema),
      update: oc.input(Types.flagSchema).output(Types.flagSchema),
      create: oc
        .input(
          z.object({
            name: z.string(),
            s3key: z.string(),
          }),
        )
        .output(Types.flagSchema),
      delete: oc
        .input(z.object({ flagId: z.string() }))
        .output(Types.flagSchema),
    },
    org: {
      custom: oc.output(z.array(Types.flagSchema)),
      all: oc.output(z.array(Types.flagSchema)),
      update: oc.input(Types.flagSchema).output(Types.flagSchema),
      delete: oc
        .input(z.object({ flagId: z.string() }))
        .output(Types.flagSchema),
      create: oc
        .input(
          z.object({
            name: z.string(),
            s3key: z.string(),
          }),
        )
        .output(Types.flagSchema),
    },
  },
  trackable: {
    participant: {
      create: oc
        .input(
          z.object({
            eventId: z.string(),
            deviceId: z.string().nullable(),
            name: z.string().optional(),
          }),
        )
        .output(z.any()),
      find: oc
        .input(z.object({ participantId: z.string() }))
        .output(Types.ParticipantSchema),
      positions: oc
        .input(
          z.object({
            participantId: z.string(),
            start: z.string(),
            stop: z.string(),
            highres: z.boolean(),
          }),
        )
        .output(z.array(Types.PositionSchema)),
    },
    event: {
      create: oc
        .input(
          z.object({
            orgId: z.string(),
            name: z.string(),
          }),
        )
        .output(Types.TEventSchema),
      update: oc.input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          eventType: z.number().optional(),
          isSailviz: z.boolean().optional(),
          loop: z.boolean().optional(),
        }),
      ),
      find: oc
        .input(z.object({ eventId: z.string() }))
        .output(Types.TEventSchema),
    },
    device: {
      list: oc
        .input(z.object({ orgId: z.string() }))
        .output(z.array(Types.DeviceSchema)),
      positions: oc
        .input(
          z.object({
            deviceId: z.string(),
            start: z.string(),
            stop: z.string(),
            highres: z.boolean(),
          }),
        )
        .output(z.array(Types.PositionSchema)),
    },
    waypoint: {
      setEvent: oc.input(
        z.object({
          waypoints: z.array(
            z.object({
              order: z.number(),
              name: z.string(),
              lat: z.number(),
              lon: z.number(),
              blat: z.number().optional(),
              blon: z.number().optional(),
            }),
          ),
          eventId: z.string(),
        }),
      ),
    },
  },
} as const;
