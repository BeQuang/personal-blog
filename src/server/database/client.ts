import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { z } from "zod";

import * as schema from "./schema";

const databaseUrl = z
  .string()
  .min(1, "DATABASE_URL is required")
  .refine(
    (value) => value.startsWith("postgres://") || value.startsWith("postgresql://"),
    "DATABASE_URL must be a PostgreSQL connection string",
  )
  .parse(process.env.DATABASE_URL);

const globalForDatabase = globalThis as typeof globalThis & {
  postgresClient?: ReturnType<typeof postgres>;
};

const configuredPoolMaximum = z.coerce
  .number()
  .int()
  .min(1)
  .max(10)
  .default(process.env.NODE_ENV === "production" ? 2 : 5)
  .parse(process.env.DATABASE_POOL_MAX);

export const postgresClient =
  globalForDatabase.postgresClient ??
  postgres(databaseUrl, {
    connect_timeout: 10,
    idle_timeout: 20,
    max: configuredPoolMaximum,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.postgresClient = postgresClient;
}

export const database = drizzle(postgresClient, { schema });

export type Database = typeof database;
