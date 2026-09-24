import { prisma } from "./prisma.services.js";
import { deliveryQueue } from "../queues/delivery.queue.js";

export const retryDelivery = async (
  deliveryId: string,
  projectId: string
) => {
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
    return {
      type: "NOT_FOUND" as const,
    };
  }

  if (delivery.event.projectId !== projectId) {
    return {
      type: "FORBIDDEN" as const,
    };
  }

  if (delivery.status !== "DEAD") {
    return {
      type: "INVALID_STATUS" as const,
      status: delivery.status,
    };
  }

  const result = await prisma.delivery.updateMany({
    where: {
      id: delivery.id,
      status: "DEAD",
    },
    data: {
      status: "PENDING",
      lastError: null,
      nextRetryAt: null,
    },
  });

  if (result.count === 0) {
    return {
      type: "INVALID_STATUS" as const,
      status: "PENDING" as const,
    };
  }

  await deliveryQueue.add("deliver-webhook", {
    deliveryId: delivery.id,
  });

  return {
    type: "SUCCESS" as const,
    deliveryId: delivery.id,
  };
};