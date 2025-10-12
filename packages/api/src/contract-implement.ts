import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "./contract";
import prisma from "@sailviz/db";
import { countRaces, findRaces, findTodaysRace } from "./routes/race";
import { findSeries } from "./routes/series";
import z from "zod";
import { RaceSchema } from "packages/types/src/types";
const os = implement(ORPCcontract);

const hello = os.hello.handler(({ input }) => {
  // input is optional in the contract; guard against undefined here.
  console.log("Input received:", input);

  const name = input?.name ?? "World";

  return { name, message: `Hello, ${name}!` };
});

const getGlobalLaps = os.getGlobalLaps.handler(async ({ context }) => {
  var laps = await prisma.lap.count({});
  console.log(laps);
  if (laps) {
    return laps;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});

const todaysRaces = os.todaysRaces.handler(async ({ input }) => {
  const races = await findTodaysRace(input.clubId);
  console.log(races);
  if (races) {
    return races;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});

const racebyClubId = os.racebyClubId.handler(async ({ input }) => {
  const series = await findSeries(input.clubId);

  if (!series || series.length === 0) {
    throw new ORPCError("NOT_FOUND");
  }

  const count = await countRaces(
    series.map((s) => s.id),
    input.date,
    input.historical
  );
  const races = await findRaces(
    series.map((s) => s.id),
    input.page ?? 0,
    100,
    input.date,
    input.historical ?? false
  );
  return { races, count };
});

const seriesbyClubId = os.seriesbyClubId.handler(async ({ input }) => {
  const series = await findSeries(input.clubId);
  if (series) {
    return series;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});

export const mainRouter = os.router({
  hello,
  getGlobalLaps,
  todaysRaces,
  racebyClubId,
  seriesbyClubId,
});
