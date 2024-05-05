type RaceDataType = {
  [key: string]: any;
  id: string;
  number: number;
  OOD: string;
  AOD: string;
  SO: string;
  ASO: string;
  results: ResultsType[];
  Time: string;
  startTime: number;
  Type: string;
  seriesId: string;
  series: SeriesDataType;
};

type SeriesDataType = {
  [key: string]: any;
  id: string;
  name: string;
  clubId: string;
  settings: SettingsType;
  races: RaceDataType[];
};

type ResultsDataType = {
  [key: string]: any;
  id: string;
  raceId: string;
  Helm: string;
  Crew: string;
  boat: BoatDataType;
  SailNumber: string;
  finishTime: number;
  lapTimes: lapTimesType;
  CorrectedTime: number;
  Position: number;
};

type lapTimesType = {
  times: Array;
  number: number;
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
  [key: string]: any;
  numberToCount: number;
};

type ClubSettingsType = {
  [key: string]: any;
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
  [key: string]: any;
  id: string;
  name: string;
  seriesId: String;
  startTime: number;
  boats: BoatDataType[];
};
