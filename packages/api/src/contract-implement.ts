import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "./contract";
import prisma from "@sailviz/db";
import { countRaces, findRace, findRaces, findTodaysRace } from "./routes/race";
import { findSeries } from "./routes/series";
import { findBoats } from "./routes/boats";
import { auth } from "@sailviz/auth/auth";
import { RequestHeadersPluginContext } from "@orpc/server/plugins";

interface ORPCContext extends RequestHeadersPluginContext {
  req: Request;
}
const os = implement(ORPCcontract);

const authMiddleware = os
  .$context<ORPCContext>()
  .middleware(async ({ context, next }) => {
    // Build a Request from forwarded headers so getSession can read cookies.
    const req = new Request("http://localhost", {
      headers: context.reqHeaders as HeadersInit,
    });
    // Use server-side auth API so cookie parsing is performed by the same
    // runtime that issued the session cookie.
    const session = await auth.api.getSession(req as unknown as Request);
    const result = await next({
      context: {
        ...context,
        session,
      },
    });
    return result;
  });

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

const racebyId = os.racebyId.handler(async ({ input }) => {
  const race = await findRace(input.raceId);
  if (race) {
    return race;
  } else {
    throw new ORPCError("NOT_FOUND");
  }
});

const boats = os.boats.use(authMiddleware).handler(async ({ context }) => {
  const session = context.session as any; // this is because the session type is not quite correct
  const clubId = session.club.id;
  const boatsList = await findBoats(clubId);
  if (boatsList) {
    return boatsList;
  } else {
    throw new ORPCError("NOT_FOUND");
  }
});

export const mainRouter = os.router({
  hello,
  getGlobalLaps,
  todaysRaces,
  racebyClubId,
  seriesbyClubId,
  racebyId,
  boats,
});
