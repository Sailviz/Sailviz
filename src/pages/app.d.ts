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
  SailNumber: number;
  finishTime: number;
  lapTimes: object;
  CorrectedTime: number;
  Position: number;
};

type SettingsType = {
  [key: string]: any;
  numberToCount: number;
};

type BoatDataType = {
  id: string;
  name: string;
  crew: number;
  py: number;
  clubId: string;
};

type ClubDataType = {
  id: string;
  name: string;
  settings: object;
  series: SeriesDataType[];
  boats: BoatDataType[];
};
