import { prisma } from "./prisma.services.js";

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
    where: {
      id: projectId,
    },
  });

  if (!project) {
    return null;
  }

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

    if (endpoints.length > 0) {
      await tx.delivery.createMany({
        data: endpoints.map((endpoint) => ({
          eventId: event.id,
          webhookEndpointId: endpoint.id,
        })),
      });
    }

    return event;
  });

  return result;
};