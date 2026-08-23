import { Queue } from "bullmq";
import { redis } from "./redis.js";

export const analysisQueue = new Queue("analysis", {
  connection: redis,
});
