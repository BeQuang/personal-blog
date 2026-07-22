import "server-only";

import { and, asc, count, desc, eq, ilike, isNotNull, isNull, or, sql } from "drizzle-orm";

import { database } from "@/server/database/client";
import {
  auditLogs,
  campaigns,
  contactSubmissions,
  events,
  galleryItems,
  mediaAssets,
  posts,
  siteSettings,
  videos,
} from "@/server/database/schema";
import type { MediaLibraryQuery } from "@/types";

export type MediaAssetRow = typeof mediaAssets.$inferSelect;
export type NewMediaAssetRow = typeof mediaAssets.$inferInsert;

export async function findMediaAssetById(id: string) {
  const [row] = await database
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1);
  return row ?? null;
}

export async function findMediaAssetByObjectKey(objectKey: string) {
  const [row] = await database
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.objectKey, objectKey))
    .limit(1);

  return row ?? null;
}

export async function findAllMediaObjectKeys() {
  const rows = await database
    .select({ objectKey: mediaAssets.objectKey })
    .from(mediaAssets)
    .where(isNotNull(mediaAssets.objectKey));
  return new Set(rows.flatMap((row) => row.objectKey ? [row.objectKey] : []));
}

export async function insertMediaAssetIfMissing(values: NewMediaAssetRow) {
  const existing = values.objectKey
    ? await findMediaAssetByObjectKey(values.objectKey)
    : null;
  if (existing) return { operation: "skipped" as const, row: existing };

  const [row] = await database.insert(mediaAssets).values(values).returning();
  return { operation: "inserted" as const, row };
}

export async function createMediaAsset(values: NewMediaAssetRow, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [row] = await transaction.insert(mediaAssets).values(values).returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "media.create",
      entityType: "media_asset",
      entityId: row.id,
      afterData: {
        mimeType: row.mimeType,
        objectKey: row.objectKey,
        purpose: row.metadata.purpose,
        sizeBytes: row.sizeBytes,
      },
    });
    return row;
  });
}

export async function findMediaLibrary(
  input: Required<Pick<MediaLibraryQuery, "page" | "pageSize">> & MediaLibraryQuery,
) {
  const conditions = and(
    eq(mediaAssets.type, "image"),
    eq(mediaAssets.status, "ready"),
    eq(mediaAssets.visibility, "public"),
    isNotNull(mediaAssets.publicUrl),
    isNull(mediaAssets.deletedAt),
    input.mimeType && input.mimeType !== "all"
      ? eq(mediaAssets.mimeType, input.mimeType)
      : undefined,
    input.purpose && input.purpose !== "all"
      ? sql`${mediaAssets.metadata}->>'purpose' = ${input.purpose}`
      : undefined,
    input.query
      ? or(
          ilike(mediaAssets.originalFilename, `%${input.query}%`),
          ilike(mediaAssets.alt, `%${input.query}%`),
          ilike(mediaAssets.objectKey, `%${input.query}%`),
        )
      : undefined,
  );
  const offset = (input.page - 1) * input.pageSize;
  const [items, totals] = await Promise.all([
    database
      .select()
      .from(mediaAssets)
      .where(conditions)
      .orderBy(desc(mediaAssets.createdAt))
      .limit(input.pageSize)
      .offset(offset),
    database.select({ value: count() }).from(mediaAssets).where(conditions),
  ]);
  return { items, total: totals[0]?.value ?? 0 };
}

export async function findMediaPickerItems(limit = 500) {
  return database
    .select()
    .from(mediaAssets)
    .where(and(
      eq(mediaAssets.type, "image"),
      eq(mediaAssets.status, "ready"),
      eq(mediaAssets.visibility, "public"),
      isNotNull(mediaAssets.publicUrl),
      isNull(mediaAssets.deletedAt),
    ))
    .orderBy(desc(mediaAssets.createdAt))
    .limit(limit);
}

export async function softDeleteMediaAssetIfUnused(id: string, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction
      .select()
      .from(mediaAssets)
      .where(and(eq(mediaAssets.id, id), isNull(mediaAssets.deletedAt)))
      .for("update")
      .limit(1);
    if (!before) return { outcome: "not_found" as const };

    const checks = await Promise.all([
      transaction.select({ id: posts.id }).from(posts).where(or(eq(posts.thumbnailMediaId, id), eq(posts.coverMediaId, id))).limit(1),
      transaction.select({ id: galleryItems.id }).from(galleryItems).where(eq(galleryItems.mediaAssetId, id)).limit(1),
      transaction.select({ id: events.id }).from(events).where(eq(events.bannerMediaId, id)).limit(1),
      transaction.select({ id: campaigns.id }).from(campaigns).where(eq(campaigns.bannerMediaId, id)).limit(1),
      transaction.select({ id: siteSettings.id }).from(siteSettings).where(or(eq(siteSettings.avatarMediaId, id), eq(siteSettings.coverMediaId, id))).limit(1),
      transaction.select({ id: videos.id }).from(videos).where(or(eq(videos.thumbnailMediaId, id), eq(videos.videoMediaId, id))).limit(1),
      transaction.select({ id: contactSubmissions.id }).from(contactSubmissions).where(eq(contactSubmissions.attachmentMediaId, id)).limit(1),
    ]);
    const labels = ["post", "gallery", "event", "campaign", "site settings", "video", "contact submission"];
    const usage = labels.filter((_, index) => checks[index].length > 0);
    if (usage.length > 0) return { outcome: "in_use" as const, usage };

    const deletedAt = new Date();
    const [row] = await transaction
      .update(mediaAssets)
      .set({ status: "deleted", deletedAt, updatedAt: deletedAt })
      .where(and(eq(mediaAssets.id, id), isNull(mediaAssets.deletedAt)))
      .returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "media.delete",
      entityType: "media_asset",
      entityId: row.id,
      beforeData: { objectKey: before.objectKey, status: before.status },
      afterData: { status: row.status },
    });
    return { outcome: "deleted" as const, row };
  });
}

export async function restoreMediaAssetAfterStorageFailure(id: string, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [row] = await transaction
      .update(mediaAssets)
      .set({ status: "ready", deletedAt: null, updatedAt: new Date() })
      .where(and(eq(mediaAssets.id, id), eq(mediaAssets.status, "deleted"), isNotNull(mediaAssets.deletedAt)))
      .returning();
    if (!row) return null;
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "media.delete.rollback",
      entityType: "media_asset",
      entityId: row.id,
      beforeData: { status: "deleted" },
      afterData: { status: row.status },
    });
    return row;
  });
}

export function findAvailablePostMedia() {
  return database
    .select({
      id: mediaAssets.id,
      originalFilename: mediaAssets.originalFilename,
      alt: mediaAssets.alt,
      publicUrl: mediaAssets.publicUrl,
    })
    .from(mediaAssets)
    .where(
      and(
        eq(mediaAssets.type, "image"),
        eq(mediaAssets.status, "ready"),
        eq(mediaAssets.visibility, "public"),
        isNotNull(mediaAssets.publicUrl),
        isNull(mediaAssets.deletedAt),
      ),
    )
    .orderBy(asc(mediaAssets.originalFilename));
}
