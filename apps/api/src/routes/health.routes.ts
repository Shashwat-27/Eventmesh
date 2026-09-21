import { Router } from "express";
import {
  healthCheck,
  testError
} from "../controllers/health.controller.js";

const router = Router();

router.get("/health", healthCheck);
router.get("/test-error", testError);

export default router;