import { prisma } from "./prisma.services.js";

export interface CreateProjectInput {
  tenantId: string;
  name: string;
}

export const createProject = async ({
  tenantId,
  name
}: CreateProjectInput) => {
  const tenant = await prisma.tenant.findUnique({
    where: {
      id: tenantId
    }
  });

  if (!tenant) {
    return null;
  }

  const project = await prisma.project.create({
    data: {
      tenantId,
      name
    }
  });

  return project;
};