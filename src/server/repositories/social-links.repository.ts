import "server-only";

import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";

import { database } from "@/server/database/client";
import {
  auditLogs,
  socialLinks,
  socialOauthConnections,
} from "@/server/database/schema";
import type { AdminSocialLinkListQuery } from "@/types";

export type SocialLinkRow = typeof socialLinks.$inferSelect;
export type NewSocialLinkRow = typeof socialLinks.$inferInsert;
export type SocialOauthConnectionRow = typeof socialOauthConnections.$inferSelect;
export type NewSocialOauthConnectionRow = typeof socialOauthConnections.$inferInsert;

export function findSocialLinks() {
  return database.select().from(socialLinks).orderBy(asc(socialLinks.sortOrder));
}

export async function findSocialLinkPage(query: AdminSocialLinkListQuery) {
  const offset = (query.page - 1) * query.pageSize;
  const pattern = `%${query.query}%`;
  const searchCondition = query.query
    ? or(
        ilike(socialLinks.label, pattern),
        ilike(socialLinks.platform, pattern),
        ilike(socialLinks.username, pattern),
        ilike(socialLinks.url, pattern),
      )
    : undefined;
  const platformCondition = query.platform === "all"
    ? undefined
    : eq(socialLinks.platform, query.platform);
  const where = and(searchCondition, platformCondition);
  const sortColumn = {
    createdAt: socialLinks.createdAt,
    enabled: socialLinks.enabled,
    followerCount: socialLinks.followerCount,
    label: socialLinks.label,
    sortOrder: socialLinks.sortOrder,
    updatedAt: socialLinks.updatedAt,
  }[query.sortBy];
  const direction = query.sortOrder === "asc" ? asc : desc;
  const primarySort = query.sortBy === "followerCount"
    ? query.sortOrder === "asc"
      ? sql`${socialLinks.followerCount} asc nulls last`
      : sql`${socialLinks.followerCount} desc nulls last`
    : direction(sortColumn);
  const [items, totals] = await Promise.all([
    database
      .select()
      .from(socialLinks)
      .where(where)
      .orderBy(primarySort, asc(socialLinks.sortOrder), asc(socialLinks.id))
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

export function findYouTubeSocialLinksForSync() {
  return database
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.platform, "youtube"))
    .orderBy(asc(socialLinks.id))
    .limit(100);
}

export function findTikTokSocialLinksForSync() {
  return database
    .select({
      link: socialLinks,
      connection: socialOauthConnections,
    })
    .from(socialOauthConnections)
    .innerJoin(socialLinks, eq(socialOauthConnections.socialLinkId, socialLinks.id))
    .where(and(
      eq(socialOauthConnections.provider, "tiktok"),
      eq(socialLinks.platform, "tiktok"),
    ))
    .orderBy(asc(socialLinks.id))
    .limit(100);
}

export async function findSocialLinkById(id: string) {
  const [row] = await database.select().from(socialLinks).where(eq(socialLinks.id, id)).limit(1);
  return row ?? null;
}

export async function findSocialOauthConnectionByLinkId(socialLinkId: string) {
  const [row] = await database
    .select()
    .from(socialOauthConnections)
    .where(eq(socialOauthConnections.socialLinkId, socialLinkId))
    .limit(1);
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
    if (before.platform === "tiktok" && row.platform !== "tiktok") {
      await transaction
        .delete(socialOauthConnections)
        .where(eq(socialOauthConnections.socialLinkId, id));
    }
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

export async function updateSocialLinkAudienceSync(
  id: string,
  values: Pick<
    Partial<NewSocialLinkRow>,
    | "audienceLastSyncedAt"
    | "audienceSyncError"
    | "audienceSyncStatus"
    | "externalId"
    | "followerCount"
    | "likesCount"
  >,
) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction.select().from(socialLinks).where(eq(socialLinks.id, id)).limit(1);
    if (!before) return null;
    const [row] = await transaction
      .update(socialLinks)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(socialLinks.id, id))
      .returning();
    await transaction.insert(auditLogs).values({
      actorProfileId: null,
      action: "social_link.audience.sync",
      entityType: "social_link",
      entityId: row.id,
      beforeData: {
        followerCount: before.followerCount,
        likesCount: before.likesCount,
        syncStatus: before.audienceSyncStatus,
      },
      afterData: {
        followerCount: row.followerCount,
        likesCount: row.likesCount,
        syncStatus: row.audienceSyncStatus,
      },
    });
    return row;
  });
}

export interface ConnectTikTokSocialLinkValues {
  connection: Omit<NewSocialOauthConnectionRow, "socialLinkId" | "provider">;
  link: Pick<
    NewSocialLinkRow,
    | "audienceLastSyncedAt"
    | "audienceSource"
    | "audienceSyncError"
    | "audienceSyncStatus"
    | "externalId"
    | "followerCount"
    | "likesCount"
    | "url"
    | "username"
  >;
}

export async function connectTikTokSocialLink(
  socialLinkId: string,
  values: ConnectTikTokSocialLinkValues,
  actorProfileId: string,
) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction
      .select()
      .from(socialLinks)
      .where(eq(socialLinks.id, socialLinkId))
      .limit(1);
    if (!before || before.platform !== "tiktok") return null;

    await transaction
      .insert(socialOauthConnections)
      .values({
        ...values.connection,
        socialLinkId,
        provider: "tiktok",
      })
      .onConflictDoUpdate({
        target: socialOauthConnections.socialLinkId,
        set: {
          ...values.connection,
          provider: "tiktok",
          connectedAt: new Date(),
          updatedAt: new Date(),
        },
      });

    const [row] = await transaction
      .update(socialLinks)
      .set({ ...values.link, updatedAt: new Date() })
      .where(eq(socialLinks.id, socialLinkId))
      .returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "social_link.tiktok.connect",
      entityType: "social_link",
      entityId: row.id,
      beforeData: {
        audienceSource: before.audienceSource,
        followerCount: before.followerCount,
        likesCount: before.likesCount,
      },
      afterData: {
        audienceSource: row.audienceSource,
        followerCount: row.followerCount,
        likesCount: row.likesCount,
      },
    });
    return row;
  });
}

export async function updateSocialOauthConnectionTokens(
  id: string,
  values: Pick<
    NewSocialOauthConnectionRow,
    | "accessTokenCiphertext"
    | "accessTokenExpiresAt"
    | "providerUserId"
    | "refreshTokenCiphertext"
    | "refreshTokenExpiresAt"
    | "scopes"
  >,
) {
  const [row] = await database
    .update(socialOauthConnections)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(socialOauthConnections.id, id))
    .returning();
  return row ?? null;
}

export async function disconnectTikTokSocialLink(
  socialLinkId: string,
  actorProfileId: string,
) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction
      .select()
      .from(socialLinks)
      .where(eq(socialLinks.id, socialLinkId))
      .limit(1);
    if (!before || before.platform !== "tiktok") return null;
    await transaction
      .delete(socialOauthConnections)
      .where(eq(socialOauthConnections.socialLinkId, socialLinkId));
    const [row] = await transaction
      .update(socialLinks)
      .set({
        externalId: null,
        audienceSource: "manual",
        audienceSyncStatus: "manual",
        audienceLastSyncedAt: null,
        audienceSyncError: null,
        updatedAt: new Date(),
      })
      .where(eq(socialLinks.id, socialLinkId))
      .returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "social_link.tiktok.disconnect",
      entityType: "social_link",
      entityId: row.id,
      beforeData: { audienceSource: before.audienceSource },
      afterData: { audienceSource: row.audienceSource },
    });
    return row;
  });
}
