
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const dbUrl = new URL(connectionString);

console.log("DATABASE HOST:", dbUrl.hostname);
console.log("DATABASE PORT:", dbUrl.port);
console.log("DATABASE USER:", dbUrl.username);
console.log("DATABASE NAME:", dbUrl.pathname);

const adapter = new PrismaPg({
  connectionString,
});

export const prisma = new PrismaClient({
  adapter,
});