import { randomBytes } from "node:crypto";
import { prisma } from "./prisma.services.js";

export interface CreateWebhookEndpointInput {
  projectId: string;
  name: string;
  url: string;
}

const generateWebhookSecret = () => {
  return randomBytes(32).toString("hex");
};

export const createWebhookEndpoint = async ({
  projectId,
  name,
  url,
}: CreateWebhookEndpointInput) => {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    return null;
  }

  const secret = generateWebhookSecret();

  const endpoint = await prisma.webhookEndpoint.create({
    data: {
      projectId,
      name,
      url,
      secret,
    },
  });

  return {
    endpoint,
    secret,
  };
};