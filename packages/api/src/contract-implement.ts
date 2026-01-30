import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "./contract";
import {
  race_create,
  race_delete,
  race_find,
  race_org,
  race_today,
  updateRace,
} from "./routes/race";
import {
  createSeries,
  deleteSeries,
  getSeries,
  series_update,
  seriesbyClubId,
} from "./routes/series";
import {
  boat_create,
  boat_delete,
  boat_find,
  boat_org,
  boat_session,
  boat_update,
} from "./routes/boats";
import {
  createFleetSettings,
  fleet_find,
  fleet_settings_delete,
  fleet_settings_find,
  fleet_settings_update,
  fleet_update,
} from "./routes/fleet";
import {
  org_all,
  org_create,
  org_find,
  org_findByStripeCustomerId,
  org_name,
  org_session,
  org_update,
} from "./routes/organization";
import {
  user_create,
  user_delete,
  user_profile_addFavourite,
  user_profile_find,
  user_profile_removeFavourite,
  user_results_all,
  user_update,
} from "./routes/user";
import {
  deleteStartSequenceStep,
  findStartSequence,
  startSequence_update,
} from "./routes/startSequence";
import { createResult, deleteResult, updateResult } from "./routes/result";
import { globalConfig_find, globalConfig_update } from "./routes/globalConfig";
import { lap_create, lap_delete } from "./routes/lap";
import { lap_global } from "./routes/globalLaps";
import { stripe_find, stripe_org, stripe_update } from "./routes/stripe";
import {
  trackable_device_list,
  trackable_event_create,
  trackable_participant_create,
} from "./routes/trackable";

const os = implement(ORPCcontract);

export const mainRouter = os.router({
  lap: {
    global: lap_global,
    create: lap_create,
    delete: lap_delete,
  },
  stripe: {
    find: stripe_find,
    update: stripe_update,
    org: stripe_org,
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
    today: race_today,
    org: race_org,
    find: race_find,
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
    find: fleet_find,
    update: fleet_update,
    settings: {
      create: createFleetSettings,
      find: fleet_settings_find,
      delete: fleet_settings_delete,
      update: fleet_settings_update,
    },
  },
  organization: {
    session: org_session,
    update: org_update,
    all: org_all,
    create: org_create,
    find: org_find,
    name: org_name,
    findByStripeCustomerId: org_findByStripeCustomerId,
  },
  boat: {
    find: boat_find,
    session: boat_session,
    update: boat_update,
    create: boat_create,
    delete: boat_delete,
    org: boat_org,
  },
  user: {
    update: user_update,
    create: user_create,
    delete: user_delete,
    profile: {
      find: user_profile_find,
      addFavourite: user_profile_addFavourite,
      removeFavourite: user_profile_removeFavourite,
    },
    results: {
      all: user_results_all,
    },
  },
  globalConfig: {
    find: globalConfig_find,
    update: globalConfig_update,
  },
  trackable: {
    participant: {
      create: trackable_participant_create,
    },
    event: {
      create: trackable_event_create,
    },
    device: {
      list: trackable_device_list,
    },
  },
});
