import { Router } from "express";
import { createApiKeyController } from "../controllers/api-key.controller.js";
import { apiKeyAuth } from "../middleware/api-key-auth.middleware.js";

const router = Router();

router.post(
  "/v1/projects/:projectId/api-keys",
  apiKeyAuth,
  createApiKeyController
);

export default router;