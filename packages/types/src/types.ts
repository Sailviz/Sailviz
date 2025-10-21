import z, { uuid } from "zod";

export const DutySchema = z.any();
export type DutyType = z.infer<typeof DutySchema>;

export const LapSchema = z.object({
  id: z.string(),
  resultId: z.string(),
  time: z.number(),
});
export type LapType = z.infer<typeof LapSchema>;

export const ResultSchema = z.object({
  id: z.string(),
  fleetId: z.string(),
  Helm: z.string(),
  Crew: z.string(),
  SailNumber: z.string(),
  finishTime: z.number(),
  numberLaps: z.number(),
  laps: LapSchema.array().optional(),
  CorrectedTime: z.number(),
  PursuitPosition: z.number(),
  HandicapPosition: z.number(),
  resultCode: z.string(),
  boat: z.any().optional(), //need to define BoatSchema
});
export type ResultType = z.infer<typeof ResultSchema>;

export const FleetSchema = z.object({
  id: z.string(),
  raceId: z.string(),
  startTime: z.number(),
  fleetSettings: z.any(),
  results: z.array(ResultSchema).optional(),
});
export type FleetType = z.infer<typeof FleetSchema>;

export const SeriesSchema = z.object({
  id: z.string(),
  name: z.string(),
  clubId: z.string(),
  settings: z.any().optional(),
  races: z.any().optional(),
  fleetSettings: z.any().optional(),
});
export type SeriesType = z.infer<typeof SeriesSchema>;

export const RaceSchema = z.object({
  id: z.string(),
  number: z.number(),
  Time: z.string(),
  Duties: DutySchema.optional(),
  Type: z.string(),
  fleets: z.array(FleetSchema).optional(),
  seriesId: z.string(),
  series: z.lazy(() => SeriesSchema.optional()),
});
export type RaceType = z.infer<typeof RaceSchema>;

export const GlobalConfigSchema = z.object({
  demoClubId: z.string(),
  demoSeriesId: z.string(),
  demoDataId: z.string(),
  demoUUID: z.string(),
});
export type GlobalConfigInputType = z.infer<typeof GlobalConfigSchema>;

export const SeriesSettingsSchema = z.object({
  numberToCount: z.number(),
  pursuitLength: z.number(),
});
export type SeriesSettingsInputType = z.infer<typeof SeriesSettingsSchema>;

export const FleetSettingsSchema = z.object({
  id: z.string(),
  name: z.string(),
  boats: z.array(z.any()),
});
export type FleetSettingsType = z.infer<typeof FleetSettingsSchema>;

export const FlagStatusSchema = z.object({
  flag: z.string(),
  status: z.boolean(),
});
export type FlagStatusInputType = z.infer<typeof FlagStatusSchema>;

export const StartSequenceStepSchema = z.object({
  id: z.string().optional(), // Optional for new steps
  time: z.number(),
  name: z.string(), // e.g., 'start', 'horn', 'clock'
  hoot: z.number(),
  order: z.number(), // Order of the step in the sequence
  fleetStart: z.string(),
  flagStatus: z.array(FlagStatusSchema),
});
export type StartSequenceStepType = z.infer<typeof StartSequenceStepSchema>;

export type RaceSettingsType = {
  numberToCount: number;
};

export const ClubSettingsSchema = z.object({
  clockIP: z.string(),
  hornIP: z.string(),
  pursuitLength: z.number(),
  clockOffset: z.number(),
  duties: z.array(z.string()),
  trackable: z.object({
    enabled: z.boolean(),
    orgID: z.string(),
  }),
});

export type ClubSettingsType = z.infer<typeof ClubSettingsSchema>;

export const BoatSchema = z.object({
  id: z.string(),
  name: z.string(),
  crew: z.number(),
  py: z.number(),
  pursuitStartTime: z.number(),
  clubId: z.string(),
});
export type BoatType = z.infer<typeof BoatSchema>;

export const ClubSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  settings: ClubSettingsSchema,
  //series: z.array(SeriesSchema).optional(), //this is needed, just commented out because it hasn't been implemented yet
  boats: BoatSchema.array().optional(),
  stripe: z.any().optional(),
});
export type ClubType = z.infer<typeof ClubSchema>;

export type Stripe = {
  customerId: string;
  subscriptionId: string;
  productId: string;
  planName: string;
  subscriptionStatus: string;
  updatedAt: string;
};

export const PermissionSchema = z.object({
  value: z.string(),
  label: z.string(),
});
export type Permission = z.infer<typeof PermissionSchema>;

export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  clubId: z.string(),
  permissions: z
    .object({
      allowed: z.array(PermissionSchema).optional(), // Array of permission objects
    })
    .optional(),
});
export type RoleType = z.infer<typeof RoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  uuid: z.string().nullable(),
  startPage: z.string(),
  admin: z.boolean(),
  email: z.string().nullable(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  displayUsername: z.string().nullable(),
  roles: z.array(RoleSchema),
  clubId: z.string(),
});
export type UserType = z.infer<typeof UserSchema>;

export type TrackerDataType = {
  trackerID: string;
  name: string;
  status?: string;
  details?: {
    orgID?: string;
    position?: {
      lat: number;
      lon: number;
      timestamp?: number;
    };
    battery?: number;
    gps?: string;
  };
};
