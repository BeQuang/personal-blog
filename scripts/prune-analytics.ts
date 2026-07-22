import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { analyticsRawRetentionDays } from "../src/config/analytics.config";

async function main() {
  if (existsSync(".env.local")) loadEnvFile(".env.local");

  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - analyticsRawRetentionDays);

  const { deleteAnalyticsEventsBefore } = await import(
    "../src/server/repositories/analytics.repository"
  );
  await deleteAnalyticsEventsBefore(cutoff);

  console.log(`Analytics raw events older than ${cutoff.toISOString()} were pruned.`);
}

void main();
