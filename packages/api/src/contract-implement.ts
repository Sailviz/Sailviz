import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "./contract";
import prisma from "@sailviz/db";
import {
  countRaces,
  findRace,
  findRaces,
  findTodaysRace,
  findTodaysRacesScoped,
  race_create,
  race_delete,
  updateRace,
} from "./routes/race";
import { translateActiveOrgToScope } from "./lib/translateActiveOrgToScope";
import {
  createSeries,
  deleteSeries,
  findClubSeries,
  getSeries,
  series_update,
  seriesbyClubId,
} from "./routes/series";
import {
  boat_create,
  boat_delete,
  findBoat,
  findBoats,
  updateBoatById,
} from "./routes/boats";
import { RequestHeadersPluginContext } from "@orpc/server/plugins";
import {
  createFleetSettings,
  findFleet,
  fleet_settings_delete,
  fleet_settings_find,
  fleet_settings_update,
  fleet_update,
} from "./routes/fleet";
import {
  club_all,
  club_create,
  club_find,
  club_findByStripeCustomerId,
  club_name,
  getClub,
  updateClubById,
} from "./routes/club";
import {
  createUserInClub,
  deleteUserById,
  getUsersByClub,
  updateUserById,
} from "./routes/user";
import {
  createRoleInClub,
  deleteRoleById,
  getRolesByClub,
  updateRoleById,
} from "./routes/role";
import {
  deleteStartSequenceStep,
  findStartSequence,
  startSequence_update,
} from "./routes/startSequence";
import { RaceType } from "@sailviz/types";
import { createResult, deleteResult, updateResult } from "./routes/result";
import { globalConfig_find, globalConfig_update } from "./routes/globalConfig";
import { lap_create, lap_delete } from "./routes/lap";
import { auth } from "@sailviz/auth/auth";

interface ORPCContext extends RequestHeadersPluginContext {
  req: Request;
}
const os = implement(ORPCcontract);

const authMiddleware = os
  .$context<ORPCContext>()
  .middleware(async ({ context, next }) => {
    // If a bearer token or x-session-token/x-token is present, resolve the
    // session directly from the database. This supports desktop clients
    // (Tauri) that send a token instead of cookies.
    const rawHeaders = context.reqHeaders as unknown;
    let token: string | null = null;
    try {
      // `context.reqHeaders` may be a Headers instance (from RequestHeadersPlugin)
      // or a plain object. Handle both cases.
      if (rawHeaders && typeof (rawHeaders as any).get === "function") {
        const h = rawHeaders as unknown as Headers;
        const ah = (h.get("authorization") || h.get("Authorization")) as
          | string
          | null;
        if (ah && ah.startsWith("Bearer ")) token = ah.slice(7);
        if (!token) {
          const xt = (h.get("x-session-token") || h.get("x-token")) as
            | string
            | null;
          if (xt) token = xt;
        }
      } else {
        const h = rawHeaders as unknown as Record<
          string,
          string | string[] | undefined
        >;
        const authHeader = h["authorization"] || h["Authorization"];
        const ah = Array.isArray(authHeader) ? authHeader[0] : authHeader;
        if (typeof ah === "string" && ah.startsWith("Bearer "))
          token = ah.slice(7);
        if (!token) {
          const xt = h["x-session-token"] || h["x-token"];
          token = Array.isArray(xt)
            ? (xt[0] as string)
            : (xt as string) || null;
        }
      }
    } catch (e) {
      token = null;
    }

    let session: any = null;
    console.debug("authMiddleware: reqHeaders=", rawHeaders);
    console.debug("authMiddleware: parsed token=", token);
    if (token) {
      // Resolve session by token using Prisma to avoid an HTTP round-trip.
      const dbSession = await prisma.session.findUnique({ where: { token } });
      console.debug(
        "authMiddleware: dbSession=",
        dbSession
          ? {
              id: dbSession.id,
              userId: dbSession.userId,
              expiresAt: dbSession.expiresAt,
            }
          : null
      );
      if (dbSession && new Date(dbSession.expiresAt) >= new Date()) {
        const user = await prisma.user.findUnique({
          where: { id: dbSession.userId },
          include: { roles: true },
        });
        let club = null;
        if (user && user.clubId) {
          club = await prisma.club.findFirst({
            where: { id: user.clubId },
            include: { stripe: true },
          });
        }
        session = { user, club, session: dbSession };
      } else {
        throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
      }
    } else {
      // Build a Request from forwarded headers so getSession can read cookies.
      const req = new Request("http://localhost", {
        headers: context.reqHeaders as HeadersInit,
      });
      // Use server-side auth API so cookie parsing is performed by the same
      // runtime that issued the session cookie.
      session = await auth.api.getSession(req as unknown as Request);
      if (!session || !session.user) {
        throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
      }
      // Validate personal:<userId> markers to prevent session hijacking.
      try {
        const activeOrg = session?.session?.activeOrganizationId;
        if (
          typeof activeOrg === "string" &&
          activeOrg.startsWith("personal:")
        ) {
          const uid = activeOrg.split(":")[1];
          if (!uid || uid !== session.user.id) {
            // clear invalid personal marker
            session.session.activeOrganizationId = null;
          }
        }
      } catch (e) {
        // ignore validation errors
      }
    }
    const result = await next({ context: { ...context, session } });
    return result;
  });

const hello = os.hello.handler(({ input }) => {
  // input is optional in the contract; guard against undefined here.
  console.log("Input received:", input);

  const name = input?.name ?? "World";

  return { name, message: `Hello, ${name}!` };
});

const getGlobalLaps = os.lap.global.handler(async ({ context }) => {
  var laps = await prisma.lap.count({});
  console.log(laps);
  if (laps) {
    return laps;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});

const todaysRaces = os.race.today
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = (context as any).session;
    const scope = translateActiveOrgToScope(session);
    let races;
    if (scope.type === "club") {
      // fall back to input.clubId if provided
      const clubId = scope.clubId ?? input.clubId;
      races = await findTodaysRace(clubId as string);
    } else if (scope.type === "personal") {
      // ensure the requested personal scope matches the authenticated user
      const authUserId = session?.user?.id;
      if (!authUserId || scope.userId !== authUserId) {
        throw new ORPCError("UNAUTHORIZED", {
          message: "Invalid personal scope",
        });
      }
      races = await findTodaysRacesScoped(scope as any);
    }
    console.log(races);
    if (races) {
      return races;
    } else {
      throw new ORPCError("BAD_REQUEST");
    }
  });

const racebyClubId = os.race.club.handler(async ({ input }) => {
  const series = await findClubSeries(input.clubId, true);

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

const racebyId = os.race.find.handler(async ({ input }) => {
  const race = await findRace(input.raceId);
  if (race) {
    return race as RaceType;
  } else {
    throw new ORPCError("NOT_FOUND");
  }
});

const boats = os.boat.session
  .use(authMiddleware)
  .handler(async ({ context }) => {
    const session = context.session as any; // this is because the session type is not quite correct
    const clubId = session.club.id;
    const boatsList = await findBoats(clubId);
    if (boatsList) {
      return boatsList;
    } else {
      throw new ORPCError("NOT_FOUND");
    }
  });

const boat = os.boat.find.use(authMiddleware).handler(async ({ input }) => {
  const boat = await findBoat(input.boatId);
  if (boat) {
    return boat;
  } else {
    throw new ORPCError("NOT_FOUND");
  }
});

const fleetbyId = os.fleet.find.handler(async ({ input }) => {
  const fleet = await findFleet(input.fleetId);
  if (fleet) {
    return fleet;
  } else {
    throw new ORPCError("NOT_FOUND");
  }
});

const club = os.club.session
  .use(authMiddleware)
  .handler(async ({ context }) => {
    const session = context.session as any; // this is because the session type is not quite correct
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const clubId = session.club.id;
    const club = await getClub(clubId);
    if (!club) {
      throw new ORPCError("NOT_FOUND");
    }
    return club;
  });

const updateBoat = os.boat.update
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const updatedBoat = await updateBoatById(input);
    if (!updatedBoat) {
      throw new ORPCError("BAD_REQUEST", { message: "Could not update boat" });
    }
    return updatedBoat;
  });

const updateClub = os.club.update
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const updatedClub = updateClubById(input);
    if (!updatedClub) {
      throw new ORPCError("BAD_REQUEST", { message: "Could not update club" });
    }
    return updatedClub;
  });

const updateUser = os.user.update
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const updatedUser = await updateUserById(input);
    if (!updatedUser) {
      throw new ORPCError("BAD_REQUEST", { message: "Could not update user" });
    }
    return updatedUser;
  });

const createUser = os.user.create
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const newUser = await createUserInClub(input.clubId);
    if (!newUser) {
      throw new ORPCError("BAD_REQUEST", { message: "Could not create user" });
    }
    return newUser;
  });

const usersByClub = os.user.club
  .use(authMiddleware)
  .handler(async ({ context, input }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const users = await getUsersByClub(input.clubId);
    if (!users) {
      throw new ORPCError("BAD_REQUEST", { message: "Could not get users" });
    }
    return users;
  });

const deleteUser = os.user.delete
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const deletedUser = await deleteUserById(input.id);
    if (!deletedUser) {
      throw new ORPCError("BAD_REQUEST", { message: "Could not delete user" });
    }
    return deletedUser;
  });

const createRole = os.role.create
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    const newRole = await createRoleInClub(input.clubId);
    if (!newRole) {
      throw new ORPCError("BAD_REQUEST", { message: "Could not create role" });
    }
    // Ensure permissions is the correct type
    //TODO: fix typing in prisma schema so this is not needed
    return {
      id: newRole.id,
      name: newRole.name,
      clubId: newRole.clubId,
      permissions:
        typeof newRole.permissions === "string"
          ? JSON.parse(newRole.permissions)
          : newRole.permissions,
    };
  });

const rolesByClub = os.role.club
  .use(authMiddleware)
  .handler(async ({ input }) => {
    const roles = await getRolesByClub(input.clubId);
    if (!roles) {
      throw new ORPCError("BAD_REQUEST", { message: "Could not get roles" });
    }
    console.log(roles);
    return roles;
  });

const updateRole = os.role.update
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const updatedRole = await updateRoleById(input);
    if (!updatedRole) {
      throw new ORPCError("BAD_REQUEST", { message: "Could not update role" });
    }
    return updatedRole;
  });

const deleteRole = os.role.delete
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const session = context.session as any;
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
    const deletedRole = await deleteRoleById(input);
    if (!deletedRole) {
      throw new ORPCError("BAD_REQUEST", { message: "Could not delete role" });
    }
    return deletedRole;
  });

export const mainRouter = os.router({
  hello,
  lap: {
    global: getGlobalLaps,
    create: lap_create,
    delete: lap_delete,
  },
  result: {
    create: createResult,
    update: updateResult,
    delete: deleteResult,
  },
  startSequence: {
    find: findStartSequence,
    delete: deleteStartSequenceStep,
    update: startSequence_update,
  },
  race: {
    today: todaysRaces,
    personal: os.race.personal
      .use(authMiddleware)
      .handler(async ({ context }) => {
        const session = (context as any).session;
        if (!session || !session.user)
          throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
        const scope = { type: "personal", userId: session.user.id } as any;
        const races = await findTodaysRacesScoped(scope);
        return races;
      }),
    club: racebyClubId,
    find: racebyId,
    update: updateRace,
    delete: race_delete,
    create: race_create,
  },
  series: {
    find: getSeries,
    club: seriesbyClubId,
    create: createSeries,
    delete: deleteSeries,
    update: series_update,
  },
  fleet: {
    find: fleetbyId,
    update: fleet_update,
    settings: {
      create: createFleetSettings,
      find: fleet_settings_find,
      delete: fleet_settings_delete,
      update: fleet_settings_update,
    },
  },
  club: {
    session: club,
    update: updateClub,
    all: club_all,
    create: club_create,
    find: club_find,
    name: club_name,
    findByStripeCustomerId: club_findByStripeCustomerId,
  },
  boat: {
    find: boat,
    session: boats,
    update: updateBoat,
    create: boat_create,
    delete: boat_delete,
  },
  user: {
    update: updateUser,
    create: createUser,
    club: usersByClub,
    delete: deleteUser,
  },
  role: {
    create: createRole,
    club: rolesByClub,
    update: updateRole,
    delete: deleteRole,
  },
  globalConfig: {
    find: globalConfig_find,
    update: globalConfig_update,
  },
});
