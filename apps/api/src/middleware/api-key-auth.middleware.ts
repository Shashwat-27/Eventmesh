import type { RequestHandler } from "express";
import { createHash } from "node:crypto";
import { prisma } from "../services/prisma.services.js";
import { AppError } from "../utils/app-error.js";

export const apiKeyAuth: RequestHandler = async (req, _res, next) => {
  try {
    const authorization = req.header("Authorization");

    if (!authorization) {
      throw new AppError(
        "Authorization header is required",
        401,
        "MISSING_API_KEY",
      );
    }

    if (!authorization.startsWith("Bearer ")) {
      throw new AppError(
        "Invalid authorization format",
        401,
        "INVALID_AUTHORIZATION",
      );
    }

    const apiKey = authorization.slice("Bearer ".length).trim();

    if (!apiKey) {
      throw new AppError("API key is required", 401, "MISSING_API_KEY");
    }

    const keyHash = createHash("sha256").update(apiKey).digest("hex");

    const storedKey = await prisma.apiKey.findFirst({
      where: {
        keyHash,
      },
    });

    if (!storedKey) {
      throw new AppError("Invalid API key", 401, "INVALID_API_KEY");
    }

    if (storedKey.revokedAt) {
      throw new AppError("API key has been revoked", 401, "API_KEY_REVOKED");
    }

    if (storedKey.expiresAt && storedKey.expiresAt <= new Date()) {
      throw new AppError("API key has expired", 401, "API_KEY_EXPIRED");
    }
    req.auth = {
      apiKeyId: storedKey.id,
      projectId: storedKey.projectId,
    };

    next();
  } catch (error) {
    next(error);
  }
};
