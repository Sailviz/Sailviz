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
  fleets: z.array(FleetSchema).optional(),
  seriesId: z.string(),
  series: z.lazy(() => SeriesSchema.optional()),
});
export type RaceType = z.infer<typeof RaceSchema>;

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
  settings: z.any(),
  // series: SeriesSchema.array(), this is needed, just commented out because it hasn't been implemented yet
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
