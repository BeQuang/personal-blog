import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

if (existsSync(".env.local")) loadEnvFile(".env.local");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");

const result = spawnSync(
  process.execPath,
  ["node_modules/drizzle-kit/bin.cjs", "migrate"],
  {
    env: {
      ...process.env,
      DIRECT_DATABASE_URL: process.env.DATABASE_URL,
    },
    stdio: "inherit",
    shell: false,
  },
);

if (result.error) throw result.error;

process.exit(result.status ?? 1);
