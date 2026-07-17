import "server-only";

import { eq } from "drizzle-orm";

import { database } from "@/server/database/client";
import { siteSettings } from "@/server/database/schema";

export type SiteSettingsRow = typeof siteSettings.$inferSelect;
export type NewSiteSettingsRow = typeof siteSettings.$inferInsert;

export function findSiteSettings(settingsKey = "default") {
  return database.query.siteSettings.findFirst({
    where: eq(siteSettings.settingsKey, settingsKey),
    with: { avatarMedia: true, coverMedia: true },
  });
}

export async function insertSiteSettingsIfMissing(values: NewSiteSettingsRow) {
  const existing = await findSiteSettings(values.settingsKey ?? "default");
  if (existing) return { operation: "skipped" as const, row: existing };

  const [row] = await database.insert(siteSettings).values(values).returning();
  return { operation: "inserted" as const, row };
}
