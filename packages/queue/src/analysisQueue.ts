import { Queue } from "bullmq";
import { redis } from "./redis.js";

export const analysisQueue = new Queue("analyseActivity", {
  connection: redis,
});
