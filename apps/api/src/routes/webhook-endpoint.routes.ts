import { Router } from "express";
import {
  createWebhookEndpointController,
} from "../controllers/webhook-endpoint.controller.js";
import { apiKeyAuth } from "../middleware/api-key-auth.middleware.js";

const router = Router();

router.post(
  "/v1/projects/:projectId/webhook-endpoints",
  apiKeyAuth,
  createWebhookEndpointController
);

export default router;