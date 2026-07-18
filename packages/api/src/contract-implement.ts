import { implement, ORPCError } from "@orpc/server";
import { ORPCcontract } from "./contract";
import {
  race_course_add,
  race_course_delete,
  race_course_update,
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
  series_tags_update,
  series_update,
  seriesbyClubId,
} from "./routes/series";
import {
  boat_org_all,
  boat_org_delete,
  boat_org_session,
  boat_org_update,
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
  duty_create,
  duty_update,
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
import { createResult, deleteResult, updateResult } from "./routes/result";
import { globalConfig_find, globalConfig_update } from "./routes/globalConfig";
import { lap_create, lap_delete } from "./routes/lap";
import { lap_global } from "./routes/globalLaps";
import { stripe_find, stripe_org, stripe_update } from "./routes/stripe";
import {
  trackable_device_list,
  trackable_device_positions,
  trackable_event_create,
  trackable_event_find,
  trackable_event_update,
  trackable_participant_create,
  trackable_participant_find,
  trackable_participant_positions,
  trackable_waypoint_setEvent,
} from "./routes/trackable";
import { orgData_update } from "./routes/organization";
import {
  buoy_create,
  buoy_delete,
  buoy_session,
  buoy_update,
} from "./routes/buoy";
import {
  image_createUploadUrl,
  image_getURL,
  image_orgBanner,
  image_saveMetadata,
} from "./routes/image";
import {
  flag_create,
  flag_custom_create,
  flag_custom_delete,
  flag_custom_update,
  flag_delete,
  flag_find,
  flag_org_all,
  flag_org_custom,
  flag_standard_all,
  flag_update,
} from "./routes/flag";
import {
  activity_createUploadUrl,
  activity_find,
  activity_getURL,
  activity_linkToResult,
  activity_positions,
  activity_saveMetadata,
} from "./routes/activity";

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
  race: {
    today: race_today,
    org: race_org,
    find: race_find,
    update: updateRace,
    delete: race_delete,
    create: race_create,
    course: {
      add: race_course_add,
      update: race_course_update,
      delete: race_course_delete,
    },
  },
  series: {
    find: getSeries,
    club: seriesbyClubId,
    create: createSeries,
    delete: deleteSeries,
    update: series_update,
    tags: {
      update: series_tags_update,
    },
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
    orgData: {
      update: orgData_update,
    },
    duties: {
      create: duty_create,
      update: duty_update,
    },
    buoys: {
      session: buoy_session,
    },
  },
  image: {
    createUploadUrl: image_createUploadUrl,
    saveMetadata: image_saveMetadata,
    getURL: image_getURL,
    orgBanner: image_orgBanner,
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
      update: boat_org_update,
      delete: boat_org_delete,
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
  buoy: {
    create: buoy_create,
    session: buoy_session,
    update: buoy_update,
    delete: buoy_delete,
  },
  flag: {
    standard: {
      all: flag_standard_all,
      create: flag_create,
      update: flag_update,
      delete: flag_delete,
      find: flag_find,
    },
    org: {
      all: flag_org_all,
      custom: flag_org_custom,
      update: flag_custom_update,
      delete: flag_custom_delete,
      create: flag_custom_create,
    },
  },
  activity: {
    createUploadUrl: activity_createUploadUrl,
    saveMetadata: activity_saveMetadata,
    find: activity_find,
    positions: activity_positions,
    linkToResult: activity_linkToResult,
    getURL: activity_getURL,
  },
  trackable: {
    participant: {
      create: trackable_participant_create,
      find: trackable_participant_find,
      positions: trackable_participant_positions,
    },
    event: {
      create: trackable_event_create,
      update: trackable_event_update,
      find: trackable_event_find,
    },
    device: {
      list: trackable_device_list,
      positions: trackable_device_positions,
    },
    waypoint: {
      setEvent: trackable_waypoint_setEvent,
    },
  },
});
