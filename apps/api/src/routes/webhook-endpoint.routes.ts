import { Router } from "express";
import {
  createWebhookEndpointController,
} from "../controllers/webhook-endpoint.controller.js";

const router = Router();

router.post(
  "/v1/projects/:projectId/webhook-endpoints",
  createWebhookEndpointController
);

export default router;