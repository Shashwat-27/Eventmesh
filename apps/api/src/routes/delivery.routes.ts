import { Router } from "express";

import { apiKeyAuth } from "../middleware/api-key-auth.middleware.js";
import {
  retryDeliveryController,
} from "../controllers/delivery.controller.js";

const router = Router();

router.post(
  "/v1/deliveries/:deliveryId/retry",
  apiKeyAuth,
  retryDeliveryController
);

export default router;