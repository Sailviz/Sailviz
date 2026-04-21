import z from "zod";

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
  userId: z.string().nullable().optional(),
  trackableParticipantId: z.string().nullable().optional(),
  SailNumber: z.string(),
  finishTime: z.number(),
  numberLaps: z.number(),
  laps: LapSchema.array(),
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
  orgId: z.string(),
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
  fleets: z.array(FleetSchema),
  seriesId: z.string(),
  trackableEventId: z.string().nullable().optional(),
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

export const BoatSchema = z.object({
  id: z.string(),
  name: z.string(),
  crew: z.number(),
  py: z.number(),
  pursuitStartTime: z.number(),
});
export type BoatType = z.infer<typeof BoatSchema>;

export const StandardBoatSchema = z.object({
  id: z.string(),
  name: z.string(),
  crew: z.number(),
  py: z.number(),
});
export type StandardBoatType = z.infer<typeof StandardBoatSchema>;

export const OrgDataSchema = z.object({
  id: z.string(),
  planName: z.string().nullable(),
  subscriptionStatus: z.string().nullable(),
  defaultPursuitLength: z.number(),
  trackableEnabled: z.boolean(),
  trackableOrgId: z.string(),
  organizationId: z.string(),
  duties: z.array(DutySchema).optional(),
});

export type OrgDataType = z.infer<typeof OrgDataSchema>;

export const BuoySchema = z.object({
  id: z.string(),
  name: z.string(),
  orgId: z.string(),
  lat: z.number(),
  lon: z.number(),
  isMoveable: z.boolean(),
  trackerId: z.string().nullable(),
});

export type BuoyType = z.infer<typeof BuoySchema>;

export const OrgSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string().nullable(),
  slug: z.string(),
  stripeCustomerId: z.string().optional().nullable(),
  orgDataId: z.string().optional().nullable(),
  orgData: OrgDataSchema.optional(),
});
export type Org = z.infer<typeof OrgSchema>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  startPage: z.string().optional(),
  email: z.string().nullable(),
  emailVerified: z.boolean().optional(),
  image: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type UserType = z.infer<typeof UserSchema>;

export const userFavouriteOrgsSchema = z.object({
  orgId: z.string(),
  organization: OrgSchema,
});
export type userFavouriteOrgsType = z.infer<typeof userFavouriteOrgsSchema>;

export const signOnProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  Helm: z.string(),
  Crew: z.string(),
  Boat: StandardBoatSchema,
  SailNumber: z.string(),
});
export type SignOnProfile = z.infer<typeof signOnProfileSchema>;

export const MemberSchema = z.object({
  user: UserSchema,
  id: z.string(),
  organizationId: z.string(),
  role: z.string(),
  createdAt: z.date(),
});
export type Member = z.infer<typeof MemberSchema>;

export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  organizationId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});
export type Team = z.infer<typeof TeamSchema>;

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

export const stripeSchema = z.object({
  customerId: z.string(),
  subscriptionId: z.string().nullable(),
  productId: z.string().nullable(),
  planName: z.string().nullable(),
  subscriptionStatus: z.string().nullable(),
  updatedAt: z.string().nullable(),
});
export type Stripe = z.infer<typeof stripeSchema>;

export const invitationSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  organizationName: z.string().optional(),
  email: z.string(),
  expiresAt: z.date(),
  inviterId: z.string(),
  role: z.string(),
  status: z.string(),
  teamId: z.string().optional(),
});
export type Invitation = z.infer<typeof invitationSchema>;

////////// Trackable types //////////

export const WaypointSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string(),
  lat: z.number(),
  lon: z.number(),
  radius: z.number(),
  sequence: z.number(),
  isDeleted: z.boolean(),
});
export type Waypoint = z.infer<typeof WaypointSchema>;

export const DeviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  orgId: z.string().nullable(),
  isDeleted: z.boolean(),
  product: z.any().nullable(),
  firmwareVersion: z.any().nullable(),
});
export type Device = z.infer<typeof DeviceSchema>;

export const PositionSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  timestamp: z.number(),
});
export type Position = z.infer<typeof PositionSchema>;

export const TrackerSchema = z.object({
  id: z.string(),
  position: PositionSchema,
  battery: z.number().optional(),
  gps: z.number().optional(),
  chargeStatus: z.number().optional(),
  timestamp: z.number().optional(),
});
export type Tracker = z.infer<typeof TrackerSchema>;

export const TEventSchema = z.object({
  id: z.string(),
  organisation: z.any(),
  name: z.string(),
  eventType: z.number(),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  waypoints: z.array(z.any()),
  participants: z.array(z.any()),
  isSailviz: z.boolean(),
  isRunning: z.boolean(),
  isDeleted: z.boolean(),
});
export type TEvent = z.infer<typeof TEventSchema>;
