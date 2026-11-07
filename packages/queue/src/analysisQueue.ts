import { Queue } from "bullmq";
import { redis } from "./redis.js";
import * as config from "./config.js";
export const analysisQueue = new Queue(
  config.QUEUE_NAME_PREFIX + "analyseActivity",
  {
    connection: redis,
  },
);
