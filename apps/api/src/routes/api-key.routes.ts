import { Router } from "express";
import { createApiKeyController } from "../controllers/api-key.controller.js";

const router = Router();

router.post(
  "/v1/projects/:projectId/api-keys",
  createApiKeyController
);

export default router;