import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const deliveryWorker = new Worker(
  "delivery",
  async (job) => {
    console.log("Processing delivery job:", job.id);
    console.log("Job data:", job.data);

    return {
      success: true,
    };
  },
  {
    connection: redisConnection,
  }
);

deliveryWorker.on("completed", (job) => {
  console.log(`Delivery job completed: ${job.id}`);
});

deliveryWorker.on("failed", (job, error) => {
  console.error(
    `Delivery job failed: ${job?.id}`,
    error
  );
});