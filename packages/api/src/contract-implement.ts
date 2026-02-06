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
  boat_org_all,
  boat_org_session,
  boat_standard_all,
  boat_standard_create,
  boat_standard_delete,
  boat_standard_find,
  boat_standard_update,
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
  user_addFavourite,
  user_removeFavourite,
  user_results_all,
  user_signOnProfile_create,
  user_signOnProfile_update,
  user_update,
  user_signOnProfile_delete,
  user_signOnProfile_all,
  user_favouriteOrgs,
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
    standard: {
      find: boat_standard_find,
      update: boat_standard_update,
      create: boat_standard_create,
      delete: boat_standard_delete,
      all: boat_standard_all,
    },
    org: {
      session: boat_org_session,
      all: boat_org_all,
    },
  },
  user: {
    update: user_update,
    create: user_create,
    delete: user_delete,
    favouriteOrgs: user_favouriteOrgs,
    addFavourite: user_addFavourite,
    removeFavourite: user_removeFavourite,
    signOnProfile: {
      all: user_signOnProfile_all,
      create: user_signOnProfile_create,
      update: user_signOnProfile_update,
      delete: user_signOnProfile_delete,
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
