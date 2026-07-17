import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { defineConfig } from "drizzle-kit";
import { z } from "zod";

if (existsSync(".env.local")) {
  loadEnvFile(".env.local");
}

const databaseUrl = z
  .string()
  .min(1, "DIRECT_DATABASE_URL is required")
  .refine(
    (value) => value.startsWith("postgres://") || value.startsWith("postgresql://"),
    "DIRECT_DATABASE_URL must be a PostgreSQL connection string",
  )
  .parse(process.env.DIRECT_DATABASE_URL);

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/database/schema/index.ts",
  out: "./src/server/database/migrations",
  dbCredentials: {
    url: databaseUrl,
  },
  migrations: {
    schema: "drizzle",
    table: "__drizzle_migrations",
  },
  strict: true,
  verbose: true,
});
