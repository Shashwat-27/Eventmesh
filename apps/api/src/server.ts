import "./config/load-env.js";
import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  console.log(`EventMesh API running on port ${env.port}`);
});