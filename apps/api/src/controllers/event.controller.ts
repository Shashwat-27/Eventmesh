import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";
import { createEvent } from "../services/event.service.js";

export const createEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = req.auth?.projectId;

    if (!projectId) {
      throw new AppError(
        "Authenticated project is required",
        401,
        "UNAUTHENTICATED"
      );
    }

    const { type, payload } = req.body;

    if (!type || typeof type !== "string") {
      throw new AppError(
        "Event type is required",
        400,
        "INVALID_EVENT_TYPE"
      );
    }

    if (payload === undefined || payload === null) {
      throw new AppError(
        "Event payload is required",
        400,
        "INVALID_EVENT_PAYLOAD"
      );
    }

    const event = await createEvent({
      projectId,
      type: type.trim(),
      payload,
    });

    if (!event) {
      throw new AppError(
        "Project not found",
        404,
        "PROJECT_NOT_FOUND"
      );
    }

    res.status(201).json({
      data: event,
    });
  } catch (error) {
    next(error);
  }
};