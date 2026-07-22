import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import postgres from "postgres";

if (existsSync(".env.local")) loadEnvFile(".env.local");

for (const variable of ["DATABASE_URL", "DIRECT_DATABASE_URL"]) {
  const value = process.env[variable];
  if (!value) throw new Error(`${variable} is not configured`);
  const sql = postgres(value, { connect_timeout: 10, max: 1, prepare: false });
  try {
    const [result] = await sql`select current_database() as database, current_user as role`;
    console.log(`${variable}: connected to ${result.database} as ${result.role}`);
  } catch (error) {
    console.error(`${variable}: connection failed`, {
      code: error instanceof Error && "code" in error ? error.code : undefined,
      message: error instanceof Error ? error.message : "Unknown database error",
    });
    process.exitCode = 1;
  } finally {
    await sql.end({ timeout: 5 });
  }
}
