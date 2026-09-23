import { Router } from "express";
import { createEventController } from "../controllers/event.controller.js";
import { apiKeyAuth } from "../middleware/api-key-auth.middleware.js";

const router = Router();

router.post(
  "/v1/events",
  apiKeyAuth,
  createEventController
);

export default router;