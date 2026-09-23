import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRoutes from "./routes/health.routes.js";
import tenantRoutes from "./routes/tenant.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { requestLogger } from "./middleware/request-logger.middleware.js";
import projectRoutes from "./routes/project.routes.js";


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use(healthRoutes);
app.use(tenantRoutes);
app.use(projectRoutes);

app.use(errorHandler);

export default app;