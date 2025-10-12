import z from "zod";

export const DutySchema = z.json();
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
  laps: LapSchema.array(),
  CorrectedTime: z.number(),
  PursuitPosition: z.number(),
  HandicapPosition: z.number(),
  resultCode: z.string(),
});
export type ResultType = z.infer<typeof ResultSchema>;

export const FleetSchema = z.object({
  id: z.string(),
  raceId: z.string(),
  startTime: z.number(),
  fleetSettings: z.any(),
  results: ResultSchema.array(),
});
export type FleetType = z.infer<typeof FleetSchema>;

export const SeriesSchema = z.object({
  id: z.string(),
  name: z.string(),
  clubId: z.string(),
  settings: z.any(),
  races: z.array(z.lazy(() => RaceSchema)).optional(),
  fleetSettings: z.array(z.any()).optional(),
});

export const RaceSchema = z.object({
  id: z.string(),
  number: z.number(),
  Time: z.string(),
  Duties: DutySchema,
  Type: z.string(),
  fleets: z.array(z.any()),
  seriesId: z.string(),
  series: z.lazy(() => SeriesSchema.optional()),
});
export type RaceDataType = z.infer<typeof RaceSchema>;

export type GlobalConfigType = {
  demoClubId: string;
  demoSeriesId: string;
  demoDataId: string;
  demoUUID: string;
};

export type SeriesSettingsType = {
  numberToCount: number;
  pursuitLength: number;
};

export type FleetSettingsType = {
  id: string;
  name: string;
  boats: BoatDataType[];
};

export type StartSequenceStep = {
  id?: string; // Optional for new steps
  time: number;
  name: string; // e.g., 'start', 'horn', 'clock'
  hoot: number;
  order: number; // Order of the step in the sequence
  fleetStart: string;
  flagStatus: FlagStatusType[];
};

export type FlagStatusType = {
  flag: string;
  status: boolean;
};

export const NextRaceSchema = z.object({
  id: z.string(),
  number: z.number(),
  Time: z.string(),
  series: z.object({
    name: z.string(),
    id: z.string(),
  }),
});

export type NextRaceType = z.infer<typeof NextRaceSchema>;

export type RaceSettingsType = {
  numberToCount: number;
};

export type ClubSettingsType = {
  clockIP: string;
  hornIP: string;
  pursuitLength: number;
  clockOffset: number;
  duties: string[];
  trackable: {
    enabled: boolean;
    orgID: string;
  };
};

export type BoatDataType = {
  id: string;
  name: string;
  crew: number;
  py: number;
  pursuitStartTime: number;
  clubId: string;
};

export type ClubDataType = {
  id: string;
  name: string;
  displayName: string;
  settings: ClubSettingsType;
  // series: SeriesDataType[]; this is needed, just commented out because it hasn't been implemented yet
  boats: BoatDataType[];
  stripe: Stripe;
};

export type Stripe = {
  customerId: string;
  subscriptionId: string;
  productId: string;
  planName: string;
  subscriptionStatus: string;
  updatedAt: string;
};

export type UserDataType = {
  id: string;
  displayUsername: string;
  username: string;
  admin: boolean;
  roles: RoleDataType[];
  clubId: string;
  startPage: string;
  uuid: string;
};

export type RoleDataType = {
  id: string;
  name: string;
  clubId: string;
  permissions: {
    allowed: PermissionType[];
  };
};

export type PermissionType = {
  value: string;
  label: string;
};

export type AuthedUserDataType = {
  user: UserDataType;
  token: string;
};

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
