import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const deliveryQueue = new Queue("delivery", {
  connection: redisConnection,
});