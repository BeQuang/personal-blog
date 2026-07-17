import "server-only";

import { asc, eq } from "drizzle-orm";

import { database } from "@/server/database/client";
import { auditLogs, socialLinks } from "@/server/database/schema";

export type SocialLinkRow = typeof socialLinks.$inferSelect;
export type NewSocialLinkRow = typeof socialLinks.$inferInsert;

export function findSocialLinks() {
  return database.select().from(socialLinks).orderBy(asc(socialLinks.sortOrder));
}

export function findEnabledSocialLinks() {
  return database
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.enabled, true))
    .orderBy(asc(socialLinks.sortOrder));
}

export async function findSocialLinkById(id: string) {
  const [row] = await database.select().from(socialLinks).where(eq(socialLinks.id, id)).limit(1);
  return row ?? null;
}

export async function insertSocialLinkIfMissing(values: NewSocialLinkRow) {
  const existing = values.id ? await findSocialLinkById(values.id) : null;
  if (existing) return { operation: "skipped" as const, row: existing };

  const [row] = await database.insert(socialLinks).values(values).returning();
  return { operation: "inserted" as const, row };
}

export async function createSocialLink(values: NewSocialLinkRow, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [row] = await transaction.insert(socialLinks).values(values).returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "social_link.create",
      entityType: "social_link",
      entityId: row.id,
      afterData: { platform: row.platform, enabled: row.enabled, sortOrder: row.sortOrder },
    });
    return row;
  });
}

export async function updateSocialLink(id: string, values: Partial<NewSocialLinkRow>, actorProfileId: string, auditAction = "social_link.update") {
  return database.transaction(async (transaction) => {
    const [before] = await transaction.select().from(socialLinks).where(eq(socialLinks.id, id)).limit(1);
    if (!before) return null;
    const [row] = await transaction
      .update(socialLinks)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(socialLinks.id, id))
      .returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: auditAction,
      entityType: "social_link",
      entityId: row.id,
      beforeData: { platform: before.platform, enabled: before.enabled, sortOrder: before.sortOrder },
      afterData: { platform: row.platform, enabled: row.enabled, sortOrder: row.sortOrder },
    });
    return row;
  });
}

export async function deleteSocialLink(id: string, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [row] = await transaction.delete(socialLinks).where(eq(socialLinks.id, id)).returning();
    if (!row) return null;
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "social_link.delete",
      entityType: "social_link",
      entityId: row.id,
      beforeData: { platform: row.platform, enabled: row.enabled, sortOrder: row.sortOrder },
    });
    return row;
  });
}
