import { Worker } from "bullmq";
import { redis } from "@sailviz/queue";
import { analyseActivity } from "@sailviz/analysis";

console.log("[worker] Starting Sailviz analysis worker…");

const worker = new Worker(
  "analysis",
  async (job) => {
    console.log(
      `[worker] Received job ${job.id} for activity ${job.data.activityId}`,
    );
    try {
      await analyseActivity(job.data.activityId);
      console.log(`[worker] Completed job ${job.id}`);
    } catch (err) {
      console.error(`[worker] Job ${job.id} failed`, err);
      throw err;
    }
  },
  {
    connection: redis,
    concurrency: 1, // increase later if needed
  },
);

worker.on("completed", (job) => {
  console.log(`[worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] Job ${job?.id} failed`, err);
});
