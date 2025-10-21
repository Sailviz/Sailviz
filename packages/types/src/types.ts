import { z } from "zod";

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
  laps: z.array(LapSchema),
  CorrectedTime: z.number(),
  PursuitPosition: z.number(),
  HandicapPosition: z.number(),
  resultCode: z.string(),
  // Link to BoatSchema (defined later) without introducing runtime ordering issues
  boat: z.lazy(() => BoatSchema).optional(),
});
export type ResultType = z.infer<typeof ResultSchema>;

export const FleetSchema = z.object({
  id: z.string(),
  raceId: z.string(),
  startTime: z.number(),
  // Wire to FleetSettingsSchema to avoid `any` leakage
  fleetSettings: z.lazy(() => FleetSettingsSchema),
  results: z.array(ResultSchema).optional(),
});
export type FleetType = z.infer<typeof FleetSchema>;

export const SeriesSchema = z.object({
  id: z.string(),
  name: z.string(),
  clubId: z.string(),
  // Use concrete schema for settings
  settings: z.lazy(() => SeriesSettingsSchema).optional(),
  races: z.array(z.lazy(() => RaceSchema)).optional(),
  // Provide optional series-level fleet settings if applicable
  fleetSettings: z.lazy(() => FleetSettingsSchema).optional(),
});
export type SeriesType = z.infer<typeof SeriesSchema>;

export const RaceSchema = z.object({
  id: z.string(),
  number: z.number(),
  Time: z.string(),
  Duties: DutySchema,
  Type: z.string(),
  fleets: z.array(FleetSchema),
  seriesId: z.string(),
  // Make the property optional (not the inner schema)
  series: z.lazy(() => SeriesSchema).optional(),
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
  // Ensure boats are strongly typed
  boats: z.array(z.lazy(() => BoatSchema)),
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
  stripe: z.lazy(() => StripeSchema).optional(),
});
export type ClubType = z.infer<typeof ClubSchema>;

export const StripeSchema = z.object({
  customerId: z.string(),
  subscriptionId: z.string(),
  productId: z.string(),
  planName: z.string(),
  subscriptionStatus: z.string(),
  updatedAt: z.string(),
});
export type Stripe = z.infer<typeof StripeSchema>;

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
