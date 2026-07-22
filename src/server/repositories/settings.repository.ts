import "server-only";

import { eq } from "drizzle-orm";

import { database } from "@/server/database/client";
import { auditLogs, siteSettings } from "@/server/database/schema";

export type SiteSettingsRow = typeof siteSettings.$inferSelect;
export type NewSiteSettingsRow = typeof siteSettings.$inferInsert;
export type SiteSettingsUpdate = Partial<Omit<NewSiteSettingsRow, "id" | "createdAt">>;

export function findSiteSettings(settingsKey = "default") {
  return database.query.siteSettings.findFirst({
    where: eq(siteSettings.settingsKey, settingsKey),
    with: { avatarMedia: true, coverMedia: true },
  });
}

export async function upsertSiteSettings(values: NewSiteSettingsRow, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const key = values.settingsKey ?? "default";
    const before = await transaction.query.siteSettings.findFirst({ where: eq(siteSettings.settingsKey, key) });
    const [row] = await transaction.insert(siteSettings).values(values)
      .onConflictDoUpdate({ target: siteSettings.settingsKey, set: { ...values, updatedAt: new Date() } })
      .returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: before ? "settings.update" : "settings.create",
      entityType: "site_settings",
      entityId: row.id,
      beforeData: before ? { siteName: before.siteName, contactEmail: before.contactEmail } : null,
      afterData: { siteName: row.siteName, contactEmail: row.contactEmail },
    });
    return row;
  });
}

export async function insertSiteSettingsIfMissing(values: NewSiteSettingsRow) {
  const existing = await findSiteSettings(values.settingsKey ?? "default");
  if (existing) return { operation: "skipped" as const, row: existing };

  const [row] = await database.insert(siteSettings).values(values).returning();
  return { operation: "inserted" as const, row };
}
