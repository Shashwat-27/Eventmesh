import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRoutes from "./routes/health.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(healthRoutes);

export default app;