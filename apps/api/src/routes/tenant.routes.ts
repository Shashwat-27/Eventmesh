import { Router } from "express";
import { createTenantController } from "../controllers/tenant.controller.js";

const router = Router();

router.post("/v1/tenants", createTenantController);

export default router;