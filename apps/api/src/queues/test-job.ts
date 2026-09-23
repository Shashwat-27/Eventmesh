import { deliveryQueue } from "./delivery.queue.js";

const job = await deliveryQueue.add("test-delivery", {
  deliveryId: "test-123",
  message: "Hello EventMesh",
});

console.log("Job added:", job.id);

await deliveryQueue.close();