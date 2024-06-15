type RaceDataType = {
  id: string;
  number: number;
  Time: string;
  OOD: string;
  AOD: string;
  SO: string;
  ASO: string;
  Type: string;
  fleets: FleetDataType[];
  seriesId: string;
  series: SeriesDataType;
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

type ChromecastDataType = {
  id: string;
  name: string;
  host: string;
  clubId: string;
  settings: object;
  status?: string;
};

type AvailableCastType = {
  name: string;
  host: string;
  connected: boolean;
};

type UserDataType = {
  id: string;
  displayName: string;
  settings: object;
  permLvl: number;
  clubId: string;
};

type FleetDataType = {
  id: string;
  raceId: String;
  startTime: number;
  fleetSettings: FleetSettingsType;
  results: ResultsDataType[];
};
