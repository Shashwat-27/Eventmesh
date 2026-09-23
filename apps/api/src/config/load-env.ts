import dotenv from "dotenv";
import path from "node:path";

const rootEnvPath = path.resolve(
  import.meta.dirname,
  "../../../../.env"
);

dotenv.config({
  path: rootEnvPath,
});

console.log("Root .env path:", rootEnvPath);
console.log("DATABASE_URL loaded:", Boolean(process.env.DATABASE_URL));