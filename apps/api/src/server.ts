import "dotenv/config";
import app from "./app.js";
import {env} from "./config/env.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`EventMesh API running on port ${PORT}`);
});