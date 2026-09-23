import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";
import { createApiKey } from "../services/api-key.service.js";

export const createApiKeyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectIdParam = req.params.projectId;

    if (typeof projectIdParam !== "string") {
        throw new AppError(
         "Project ID is required",
          400,
         "INVALID_PROJECT_ID"
        );
    }
    const projectId = projectIdParam;
    const { name } = req.body;


    if (!name || typeof name !== "string") {
      throw new AppError(
        "API key name is required",
        400,
        "INVALID_API_KEY_NAME"
      );
    }

    const result = await createApiKey({
      projectId,
      name: name.trim()
    });

    if (!result) {
      throw new AppError(
        "Project not found",
        404,
        "PROJECT_NOT_FOUND"
      );
    }

    res.status(201).json({
      data: {
        id: result.apiKey.id,
        projectId: result.apiKey.projectId,
        name: result.apiKey.name,
        key: result.key,
        createdAt: result.apiKey.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};