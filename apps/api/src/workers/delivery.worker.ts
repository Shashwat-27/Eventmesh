import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { prisma } from "../services/prisma.services.js";
import { generateWebhookSignature } from "../utils/webhook-signature.js";
import {
  isRetryableStatus,
  WebhookRetryableError,
  parseRetryAfter,
} from "../utils/webhook-error.js";

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

    const updatedDelivery = await prisma.delivery.update({
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

    const attemptNumber = updatedDelivery.attempts;
    const startedAt = Date.now();

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

      // AbortController is used to cancel a hanging webhook request.
      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 10_000);

      let response: Response;

      try {
        response = await fetch(delivery.webhookEndpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-EventMesh-Signature": signature,
            "X-EventMesh-Event-ID": delivery.event.id,
            "X-EventMesh-Webhook-Endpoint-ID": delivery.webhookEndpoint.id,
          },
          body: requestBody,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      const durationMs = Date.now() - startedAt;

      if (!response.ok) {
        const errorMessage = `Webhook returned HTTP ${response.status}`;

       

        if (!isRetryableStatus(response.status)) {
          await prisma.delivery.update({
            where: {
              id: delivery.id,
            },
            data: {
              status: "FAILED",
              lastError: errorMessage,
            },
          });

          console.error(
            `Non-retryable webhook failure: ${delivery.id}`,
            errorMessage,
          );

          return {
            success: false,
            deliveryId: delivery.id,
            statusCode: response.status,
            retryable: false,
          };
        }

        const retryAfterMs =
          response.status === 429
            ? parseRetryAfter(response.headers.get("Retry-After"))
            : undefined;

        throw new WebhookRetryableError(
          errorMessage,
          response.status,
          retryAfterMs,
        );
      }

      await prisma.deliveryAttempt.create({
        data: {
          deliveryId: delivery.id,
          attemptNo: attemptNumber,
          statusCode: response.status,
          durationMs,
        },
      });

      await prisma.delivery.update({
        where: {
          id: delivery.id,
        },
        data: {
          status: "SUCCESS",
          lastError: null,
          nextRetryAt: null,
        },
      });

      console.log(`Webhook delivered successfully: ${delivery.id}`);

      return {
        success: true,
        deliveryId: delivery.id,
        statusCode: response.status,
      };
    } catch (error) {
  const durationMs = Date.now() - startedAt;

  const message =
    error instanceof Error
      ? error.name === "AbortError"
        ? "Webhook request timed out after 10 seconds"
        : error.message
      : "Unknown webhook delivery error";

  const maxAttempts = job.opts.attempts ?? 1;
  const currentAttempt = job.attemptsMade + 1;
  const isFinalAttempt = currentAttempt >= maxAttempts;

  const retryDelayMs =
    error instanceof WebhookRetryableError &&
    error.retryAfterMs !== undefined
      ? error.retryAfterMs
      : 5000 * 2 ** (currentAttempt - 1);

  const nextRetryAt = isFinalAttempt
    ? null
    : new Date(Date.now() + retryDelayMs);

  await prisma.deliveryAttempt.create({
    data: {
      deliveryId: delivery.id,
      attemptNo: attemptNumber,
      statusCode:
        error instanceof WebhookRetryableError
          ? error.statusCode
          : null,
      durationMs,
      error: message,
    },
  });

  await prisma.delivery.update({
    where: {
      id: delivery.id,
    },
    data: {
      status: isFinalAttempt ? "DEAD" : "PROCESSING",
      lastError: message,
      nextRetryAt,
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

    settings: {
      backoffStrategy: (attemptsMade, type, error) => {
        if (type !== "custom") {
          throw new Error(`Unknown backoff type: ${type}`);
        }

        if (
          error instanceof WebhookRetryableError &&
          error.retryAfterMs !== undefined
        ) {
          return error.retryAfterMs;
        }

        return 5000 * 2 ** (attemptsMade - 1);
      },
    },
  },
);

deliveryWorker.on("completed", (job) => {
  console.log(`Delivery job completed: ${job.id}`);
});

deliveryWorker.on("failed", (job, error) => {
  console.error(`Delivery job failed: ${job?.id}`, error.message);
});
