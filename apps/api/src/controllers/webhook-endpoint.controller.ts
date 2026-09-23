import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";
import { createWebhookEndpoint } from "../services/webhook-endpoint.service.js";

export const createWebhookEndpointController = async (
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

    const authenticatedProjectId = req.auth?.projectId;

    if (!authenticatedProjectId) {
      throw new AppError(
        "Authentication required",
        401,
        "UNAUTHENTICATED"
      );
    }

    if (projectIdParam !== authenticatedProjectId) {
      throw new AppError(
        "You do not have access to this project",
        403,
        "PROJECT_ACCESS_DENIED"
      );
    }

    const { name, url } = req.body;

    if (!name || typeof name !== "string") {
      throw new AppError(
        "Webhook endpoint name is required",
        400,
        "INVALID_ENDPOINT_NAME"
      );
    }

    if (!url || typeof url !== "string") {
      throw new AppError(
        "Webhook URL is required",
        400,
        "INVALID_WEBHOOK_URL"
      );
    }

    const result = await createWebhookEndpoint({
      projectId: authenticatedProjectId,
      name: name.trim(),
      url: url.trim(),
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
        id: result.endpoint.id,
        projectId: result.endpoint.projectId,
        name: result.endpoint.name,
        url: result.endpoint.url,
        active: result.endpoint.active,
        secret: result.secret,
        createdAt: result.endpoint.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};