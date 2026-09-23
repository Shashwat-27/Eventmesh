import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";
import { createProject } from "../services/project.service.js";

export const createProjectController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tenantId, name } = req.body;

    if (!tenantId || typeof tenantId !== "string") {
      throw new AppError(
        "Tenant ID is required",
        400,
        "INVALID_TENANT_ID"
      );
    }

    if (!name || typeof name !== "string") {
      throw new AppError(
        "Project name is required",
        400,
        "INVALID_PROJECT_NAME"
      );
    }

    const project = await createProject({
      tenantId,
      name: name.trim()
    });

    if (!project) {
      throw new AppError(
        "Tenant not found",
        404,
        "TENANT_NOT_FOUND"
      );
    }

    res.status(201).json({
      data: project
    });
  } catch (error) {
    next(error);
  }
};