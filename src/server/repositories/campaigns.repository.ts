import "server-only";

import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";

import { database } from "@/server/database/client";
import { auditLogs, campaigns } from "@/server/database/schema";

export type CampaignRow = typeof campaigns.$inferSelect;
export type NewCampaignRow = typeof campaigns.$inferInsert;
export type CampaignUpdate = Partial<Omit<NewCampaignRow, "id" | "createdAt">>;
const campaignRelations = { bannerMedia: true } as const;

export function findPublicCampaigns() {
  return database.query.campaigns.findMany({
    orderBy: [desc(campaigns.startAt)],
    where: and(ne(campaigns.status, "draft"), isNull(campaigns.deletedAt)),
    with: campaignRelations,
  });
}

export function findCampaigns() {
  return database.query.campaigns.findMany({
    orderBy: [desc(campaigns.startAt)],
    where: isNull(campaigns.deletedAt),
    with: campaignRelations,
  });
}

export async function findCampaignById(id: string) {
  return database.query.campaigns.findFirst({
    where: and(eq(campaigns.id, id), isNull(campaigns.deletedAt)),
    with: campaignRelations,
  });
}

export async function findCampaignBySlug(slug: string, publicOnly = false) {
  return database.query.campaigns.findFirst({
    where: and(
      sql`lower(${campaigns.slug}) = ${slug.toLowerCase()}`,
      isNull(campaigns.deletedAt),
      publicOnly ? ne(campaigns.status, "draft") : undefined,
    ),
    with: campaignRelations,
  });
}

export async function findConflictingCampaignSlug(slug: string, excludedId?: string) {
  const [row] = await database.select({ id: campaigns.id }).from(campaigns).where(and(
    sql`lower(${campaigns.slug}) = ${slug.toLowerCase()}`,
    excludedId ? ne(campaigns.id, excludedId) : undefined,
  )).limit(1);
  return row ?? null;
}

export async function createCampaign(values: NewCampaignRow, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [row] = await transaction.insert(campaigns).values(values).returning();
    await transaction.insert(auditLogs).values({ actorProfileId, action: "campaign.create", entityType: "campaign", entityId: row.id, afterData: { slug: row.slug, status: row.status } });
    return row;
  });
}

export async function updateCampaign(id: string, values: CampaignUpdate, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction.select().from(campaigns).where(and(eq(campaigns.id, id), isNull(campaigns.deletedAt))).limit(1);
    if (!before) return null;
    const [row] = await transaction.update(campaigns).set({ ...values, updatedAt: new Date() }).where(and(eq(campaigns.id, id), isNull(campaigns.deletedAt))).returning();
    await transaction.insert(auditLogs).values({ actorProfileId, action: "campaign.update", entityType: "campaign", entityId: id, beforeData: { slug: before.slug, status: before.status }, afterData: { slug: row.slug, status: row.status } });
    return row;
  });
}

export async function archiveCampaign(id: string, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction.select().from(campaigns).where(and(eq(campaigns.id, id), isNull(campaigns.deletedAt))).limit(1);
    if (!before) return null;
    const [row] = await transaction.update(campaigns).set({ status: "draft", deletedAt: new Date(), updatedAt: new Date() }).where(eq(campaigns.id, id)).returning();
    await transaction.insert(auditLogs).values({ actorProfileId, action: "campaign.archive", entityType: "campaign", entityId: id, beforeData: { status: before.status }, afterData: { status: row.status, deletedAt: row.deletedAt?.toISOString() } });
    return row;
  });
}

export async function insertCampaignIfMissing(values: NewCampaignRow) {
  const existing = await findCampaignBySlug(values.slug);
  if (existing) return { operation: "skipped" as const, row: existing };

  const [row] = await database.insert(campaigns).values(values).returning();
  return { operation: "inserted" as const, row };
}
