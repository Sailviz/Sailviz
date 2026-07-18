import { Queue } from "bullmq";
import { redis } from "./redis";

export const analysisQueue = new Queue("analysis", {
  connection: redis,
});
