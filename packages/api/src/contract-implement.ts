import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "./contract";
import prisma from "@sailviz/db";
import {
  countRaces,
  findRace,
  findRaces,
  findTodaysRace,
  race_create,
  race_delete,
  updateRace,
} from "./routes/race";
import {
  createSeries,
  deleteSeries,
  findClubSeries,
  findSeries,
  getSeries,
  seriesbyClubId,
} from "./routes/series";
import {
  boat_create,
  boat_delete,
  findBoat,
  findBoats,
  updateBoatById,
} from "./routes/boats";
import { auth } from "@sailviz/auth/auth";
import { RequestHeadersPluginContext } from "@orpc/server/plugins";
import {
  createFleetSettings,
  findFleet,
  fleet_settings_delete,
  fleet_settings_find,
  fleet_settings_update,
} from "./routes/fleet";
import { club_all, club_create, getClub, updateClubById } from "./routes/club";
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
} from "./routes/startSequence";
import { RaceType } from "packages/types/src/types";
import { createResult, updateResult } from "./routes/result";
import { globalConfig_find } from "./routes/globalConfig";

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
    if (!session || !session.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
    }
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

const getGlobalLaps = os.laps.global.handler(async ({ context }) => {
  var laps = await prisma.lap.count({});
  console.log(laps);
  if (laps) {
    return laps;
  } else {
    throw new ORPCError("BAD_REQUEST");
  }
});

const todaysRaces = os.race.today.handler(async ({ input }) => {
  const races = await findTodaysRace(input.clubId);
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
  laps: {
    global: getGlobalLaps,
  },
  result: {
    create: createResult,
    update: updateResult,
  },
  startSequence: {
    find: findStartSequence,
    delete: deleteStartSequenceStep,
    update: undefined,
  },
  race: {
    today: todaysRaces,
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
  },
  fleet: {
    find: fleetbyId,
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
  },
});
