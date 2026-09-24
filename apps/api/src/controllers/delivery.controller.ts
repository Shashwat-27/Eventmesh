import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { AppError } from "../utils/app-error.js";
import { retryDelivery } from "../services/delivery.service.js";

export const retryDeliveryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deliveryId = req.params.deliveryId;

    if (typeof deliveryId !== "string") {
      throw new AppError(
        "Delivery ID is required",
        400,
        "INVALID_DELIVERY_ID"
      );
    }

    const projectId = req.auth?.projectId;

    if (!projectId) {
      throw new AppError(
        "Authentication required",
        401,
        "UNAUTHENTICATED"
      );
    }

    const result = await retryDelivery(
      deliveryId,
      projectId
    );

    if (result.type === "NOT_FOUND") {
      throw new AppError(
        "Delivery not found",
        404,
        "DELIVERY_NOT_FOUND"
      );
    }

    if (result.type === "FORBIDDEN") {
      throw new AppError(
        "You do not have access to this delivery",
        403,
        "DELIVERY_ACCESS_DENIED"
      );
    }

    if (result.type === "INVALID_STATUS") {
      throw new AppError(
        `Delivery cannot be retried from ${result.status} state`,
        409,
        "DELIVERY_NOT_RETRYABLE"
      );
    }

    res.status(202).json({
  data: {
    id: result.deliveryId,
    status: "PENDING",
  },
});
  } catch (error) {
    next(error);
  }
};