import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const deliveryQueue = new Queue("delivery", {
  connection: redisConnection,

  defaultJobOptions: {
    attempts: 5,

    backoff: {
      type: "custom",
    },

    removeOnComplete: 100,
    removeOnFail: false,
  },
});