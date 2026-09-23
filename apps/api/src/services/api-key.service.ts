import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./prisma.services.js";

export interface CreateApiKeyInput {
  projectId: string;
  name: string;
}

const generateApiKey = () => {
  const secret = randomBytes(32).toString("hex");
  return `em_live_${secret}`;
};

const hashApiKey = (key: string) => {
  return createHash("sha256").update(key).digest("hex");
};

const isValidUuid = (value: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

export const createApiKey = async ({
  projectId,
  name,
}: CreateApiKeyInput) => {
  if (!isValidUuid(projectId)) {
    return null;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return null;
  }

  const key = generateApiKey();
  const keyHash = hashApiKey(key);

  const apiKey = await prisma.apiKey.create({
    data: {
      projectId,
      name,
      keyHash,
    },
  });

  return { apiKey, key };
};