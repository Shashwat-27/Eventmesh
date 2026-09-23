import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";
import { createTenant } from "../services/tenant.service.js";

export const createTenantController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      throw new AppError(
        "Tenant name is required",
        400,
        "INVALID_TENANT_NAME"
      );
    }

    const tenant = await createTenant({
      name: name.trim()
    });

    res.status(201).json({
      data: tenant
    });
  } catch (error) {
    next(error);
  }
};