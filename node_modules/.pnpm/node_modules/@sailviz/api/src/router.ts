import { getClub } from "./routes/club";
import { getGlobalLaps } from "./routes/globalLaps";

export const router = {
  club: {
    get: getClub,
  },
  globalLaps: {
    get: getGlobalLaps,
  },
};
