import z from "zod";

export type RaceDataType = {
  id: string;
  number: number;
  Time: string;
  Duties: DutyDataType[];
  Type: string;
  fleets: FleetDataType[];
  seriesId: string;
  series: SeriesDataType;
};

export type GlobalConfigType = {
  demoClubId: string;
  demoSeriesId: string;
  demoDataId: string;
  demoUUID: string;
};
export type DutyDataType = {
  displayName: string;
  name: string;
};

export type SeriesSettingsType = {
  numberToCount: number;
  pursuitLength: number;
};

export type SeriesDataType = {
  id: string;
  name: string;
  clubId: string;
  settings: SeriesSettingsType;
  races: RaceDataType[];
  fleetSettings: FleetSettingsType[];
};

export type FleetSettingsType = {
  id: string;
  name: string;
  boats: BoatDataType[];
  fleets: FleetDataType[];
};

export type ResultDataType = {
  id: string;
  fleetId: string;
  Helm: string;
  Crew: string;
  boat: BoatDataType;
  SailNumber: string;
  finishTime: number;
  numberLaps: number;
  laps: LapDataType[];
  CorrectedTime: number;
  PursuitPosition: number;
  HandicapPosition: number;
  resultCode: string;
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

export type LapDataType = {
  id: string;
  resultId: string;
  time: number;
};

export type NextRaceDataType = {
  id: string;
  number: number;
  Time: string;
  series: {
    name: string;
    id: string;
  };
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
  series: SeriesDataType[];
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

export type FleetDataType = {
  id: string;
  raceId: string;
  startTime: number;
  fleetSettings: FleetSettingsType;
  results: ResultDataType[];
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
