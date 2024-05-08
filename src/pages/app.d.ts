type RaceDataType = {
  id: string;
  number: number;
  Time: string;
  OOD: string;
  AOD: string;
  SO: string;
  ASO: string;
  results: ResultsType[];
  Type: string;
  seriesId: string;
  series: SeriesDataType;
};

type SeriesDataType = {
  id: string;
  name: string;
  clubId: string;
  settings: SettingsType;
  races: RaceDataType[];
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
};

type LapDataType = {
  id: string;
  resultId: string;
  time: Array;
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
  boats: BoatDataType[];
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
  settings: object;
  permLvl: number;
  clubId: string;
};

type FleetDataType = {
  id: string;
  name: string;
  seriesId: String;
  startTime: number;
  startDelay: number;
  boats: BoatDataType[];
};
