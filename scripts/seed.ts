import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

if (existsSync(".env.local")) {
  loadEnvFile(".env.local");
}

async function main() {
  const validationOnly = process.argv.includes("--validate-only");
  const { seedMockContent } = await import("../src/server/services/seed.service");
  const summary = await seedMockContent({ validationOnly });

  console.log(JSON.stringify(summary, null, 2));

  if (!validationOnly) {
    const { postgresClient } = await import("../src/server/database/client");
    await postgresClient.end({ timeout: 5 });
  }
}

void main();
