import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { prisma } from "../services/prisma.services.js";
import { generateWebhookSignature } from "../utils/webhook-signature.js";

export const deliveryWorker = new Worker(
  "delivery",
  async (job) => {
    const { deliveryId } = job.data;

    console.log(
      `Processing delivery: ${deliveryId} | Attempt: ${job.attemptsMade + 1}`,
    );

    const delivery = await prisma.delivery.findUnique({
      where: {
        id: deliveryId,
      },
      include: {
        event: true,
        webhookEndpoint: true,
      },
    });

    if (!delivery) {
      throw new Error(`Delivery not found: ${deliveryId}`);
    }

    await prisma.delivery.update({
      where: {
        id: delivery.id,
      },
      data: {
        status: "PROCESSING",
        attempts: {
          increment: 1,
        },
        lastAttemptAt: new Date(),
      },
    });

    try {
      const requestBody = JSON.stringify({
        id: delivery.event.id,
        type: delivery.event.type,
        payload: delivery.event.payload,
      });

      const signature = generateWebhookSignature(
        delivery.webhookEndpoint.secret,
        requestBody,
      );

      const response = await fetch(delivery.webhookEndpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-EventMesh-Signature": signature,
          "X-EventMesh-Event-ID": delivery.event.id,
        },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error(`Webhook returned HTTP ${response.status}`);
      }

      await prisma.delivery.update({
        where: {
          id: delivery.id,
        },
        data: {
          status: "SUCCESS",
          lastError: null,
        },
      });

      console.log(`Webhook delivered successfully: ${delivery.id}`);

      return {
        success: true,
        deliveryId: delivery.id,
        statusCode: response.status,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown webhook delivery error";

      const maxAttempts = job.opts.attempts ?? 1;
      const currentAttempt = job.attemptsMade + 1;

      const isFinalAttempt = currentAttempt >= maxAttempts;

      await prisma.delivery.update({
        where: {
          id: delivery.id,
        },
        data: {
          status: isFinalAttempt ? "DEAD" : "PROCESSING",
          lastError: message,
        },
      });

      console.error(
        `Webhook delivery failed: ${delivery.id}`,
        `attempt ${currentAttempt}/${maxAttempts}`,
        message,
      );

      throw error;
    }
  },
  {
    connection: redisConnection,
  },
);

deliveryWorker.on("completed", (job) => {
  console.log(`Delivery job completed: ${job.id}`);
});

deliveryWorker.on("failed", (job, error) => {
  console.error(`Delivery job failed: ${job?.id}`, error.message);
});
