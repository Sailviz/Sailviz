type RaceDataType = {
  id: string;
  number: number;
  Time: string;
  Duties: DutyDataType[];
  Type: string;
  fleets: FleetDataType[];
  seriesId: string;
  series: SeriesDataType;
};

type DutyDataType = {
  displayName: string;
  name: string;
};

type SeriesDataType = {
  id: string;
  name: string;
  clubId: string;
  settings: SettingsType;
  races: RaceDataType[];
  fleetSettings: FleetSettingsType[];
};

type FleetSettingsType = {
  id: string;
  name: string;
  boats: BoatDataType[];
  startDelay: number;
  fleets: FleetDataType[];
};

type ResultsDataType = {
  id: string;
  fleetId: string;
  raceId: string;
  Helm: string;
  Crew: string;
  boat: BoatDataType;
  SailNumber: string;
  finishTime: number;
  laps: LapDataType[];
  CorrectedTime: number;
  PursuitPosition: number;
  HandicapPosition: number;
  resultCode: string;
};

type LapDataType = {
  id: string;
  resultId: string;
  time: number;
};

type NextRaceDataType = {
  id: string;
  number: number;
  Time: string;
  series: {
    name: string;
    id: string;
  };
};

type RaceSettingsType = {
  numberToCount: number;
};

type ClubSettingsType = {
  clockIP: string;
  hornIP: string;
  pursuitLength: number;
  clockOffset: number;
  duties: string[];
};

type BoatDataType = {
  id: string;
  name: string;
  crew: number;
  py: number;
  pursuitStartTime: number;
  clubId: string;
};

type ClubDataType = {
  id: string;
  name: string;
  settings: ClubSettingsType;
  series: SeriesDataType[];
  boats: BoatDataType[];
};

type UserDataType = {
  id: string;
  displayName: string;
  username: string;
  roles: RoleDataType[];
  clubId: string;
  startPage: string;
  uuid: string;
};

type RoleDataType = {
  id: string;
  name: string;
  clubId: string;
  permissions: {
    allowed: PermissionType[];
  };
};

type PermissionType = {
  value: string;
  label: string;
};

type FleetDataType = {
  id: string;
  raceId: String;
  startTime: number;
  fleetSettings: FleetSettingsType;
  results: ResultsDataType[];
};

type AuthedUserDataType = {
  user: UserDataType;
  token: string;
};