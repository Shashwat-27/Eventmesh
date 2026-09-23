import "./config/load-env.js";
import { deliveryWorker } from "./workers/delivery.worker.js";

console.log("EventMesh delivery worker started");

const shutdown = async () => {
  console.log("Shutting down worker...");
  await deliveryWorker.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);