import type { Request, Response } from "express";
import { AppError } from "../utils/app-error.js";

export const healthCheck = (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "eventmesh-api"
  });
};

export const testError = (_req: Request, _res: Response) => {
  throw new AppError(
    "This is a test error",
    400,
    "TEST_ERROR"
  );
};