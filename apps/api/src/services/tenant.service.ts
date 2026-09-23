import { prisma } from "./prisma.services.js";

export interface CreateTenantInput {
  name: string;
}

export const createTenant = async ({
  name
}: CreateTenantInput) => {
  const tenant = await prisma.tenant.create({
    data: {
      name
    }
  });

  return tenant;
};