import { getClub } from "./routes/club.js";
import { getGlobalLaps } from "./routes/globalLaps.js";

export const router = {
  club: {
    get: getClub,
  },
  globalLaps: {
    get: getGlobalLaps,
  },
};
