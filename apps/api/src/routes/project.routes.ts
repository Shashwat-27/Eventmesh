import { Router } from "express";
import { createProjectController } from "../controllers/project.controller.js";

const router = Router();

router.post("/v1/projects", createProjectController);

export default router;