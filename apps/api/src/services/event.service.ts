import { prisma } from "./prisma.services.js";
import { deliveryQueue } from "../queues/delivery.queue.js";

export interface CreateEventInput {
  projectId: string;
  type: string;
  payload: unknown;
}

export const createEvent = async ({
  projectId,
  type,
  payload,
}: CreateEventInput) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) return null;

  const result = await prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        projectId,
        type,
        payload,
      },
    });

    const endpoints = await tx.webhookEndpoint.findMany({
      where: {
        projectId,
        active: true,
      },
    });

    if (endpoints.length === 0) {
      return {
        event,
        deliveries: [],
      };
    }

    const deliveries = await Promise.all(
      endpoints.map((endpoint) =>
        tx.delivery.create({
          data: {
            eventId: event.id,
            webhookEndpointId: endpoint.id,
          },
        })
      )
    );

    return {
      event,
      deliveries,
    };
  });

  for (const delivery of result.deliveries) {
    await deliveryQueue.add("deliver-webhook", {
      deliveryId: delivery.id,
    });
  }

  return result.event;
};