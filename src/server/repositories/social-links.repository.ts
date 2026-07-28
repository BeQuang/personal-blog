import "server-only";

import { asc, count, desc, eq, ilike, or } from "drizzle-orm";

import { database } from "@/server/database/client";
import { auditLogs, socialLinks } from "@/server/database/schema";
import type { AdminSocialLinkListQuery } from "@/types";

export type SocialLinkRow = typeof socialLinks.$inferSelect;
export type NewSocialLinkRow = typeof socialLinks.$inferInsert;

export function findSocialLinks() {
  return database.select().from(socialLinks).orderBy(asc(socialLinks.sortOrder));
}

export async function findSocialLinkPage(query: AdminSocialLinkListQuery) {
  const offset = (query.page - 1) * query.pageSize;
  const pattern = `%${query.query}%`;
  const where = query.query
    ? or(
        ilike(socialLinks.label, pattern),
        ilike(socialLinks.platform, pattern),
        ilike(socialLinks.username, pattern),
        ilike(socialLinks.url, pattern),
      )
    : undefined;
  const sortColumn = {
    createdAt: socialLinks.createdAt,
    enabled: socialLinks.enabled,
    label: socialLinks.label,
    sortOrder: socialLinks.sortOrder,
    updatedAt: socialLinks.updatedAt,
  }[query.sortBy];
  const direction = query.sortOrder === "asc" ? asc : desc;
  const [items, totals] = await Promise.all([
    database
      .select()
      .from(socialLinks)
      .where(where)
      .orderBy(direction(sortColumn), asc(socialLinks.sortOrder), asc(socialLinks.id))
      .limit(query.pageSize)
      .offset(offset),
    database.select({ value: count() }).from(socialLinks).where(where),
  ]);
  return { items, total: totals[0]?.value ?? 0 };
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
