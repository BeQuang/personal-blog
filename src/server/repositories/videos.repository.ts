import "server-only";

import { and, desc, eq, isNotNull, isNull, lte, ne, or } from "drizzle-orm";

import { database } from "@/server/database/client";
import {
  auditLogs,
  videoWebhookEvents,
  videos,
} from "@/server/database/schema";
import type { VerifiedVideoEvent } from "@/server/video";

export type VideoRow = typeof videos.$inferSelect;
export type NewVideoRow = typeof videos.$inferInsert;
export type VideoUpdate = Partial<Omit<NewVideoRow, "id" | "createdAt">>;

const videoRelations = { thumbnailMedia: true, videoMedia: true } as const;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function findPublishedVideos(referenceDate = new Date()) {
  return database.query.videos.findMany({
    orderBy: [desc(videos.publishedAt), desc(videos.createdAt)],
    where: and(
      eq(videos.contentStatus, "published"),
      lte(videos.publishedAt, referenceDate),
      isNull(videos.deletedAt),
      or(
        ne(videos.platform, "internal"),
        and(
          eq(videos.processingStatus, "ready"),
          isNotNull(videos.muxPlaybackId),
        ),
      ),
    ),
    with: videoRelations,
  });
}

export function findVideos() {
  return database.query.videos.findMany({
    orderBy: [desc(videos.createdAt)],
    where: isNull(videos.deletedAt),
    with: videoRelations,
  });
}

export async function findVideoById(id: string) {
  return database.query.videos.findFirst({ where: eq(videos.id, id), with: videoRelations });
}

export async function insertVideoIfMissing(values: NewVideoRow) {
  const existing = values.id ? await findVideoById(values.id) : null;
  if (existing) return { operation: "skipped" as const, row: existing };

  const [row] = await database.insert(videos).values(values).returning();
  return { operation: "inserted" as const, row };
}

export async function createVideo(values: NewVideoRow, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [row] = await transaction.insert(videos).values(values).returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "video.create",
      entityType: "video",
      entityId: row.id,
      afterData: {
        contentStatus: row.contentStatus,
        muxUploadId: row.muxUploadId,
        platform: row.platform,
        processingStatus: row.processingStatus,
        title: row.title,
      },
    });
    return row;
  });
}

export async function updateVideo(
  id: string,
  values: VideoUpdate,
  actorProfileId: string,
  action = "video.update",
) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction
      .select()
      .from(videos)
      .where(and(eq(videos.id, id), isNull(videos.deletedAt)))
      .for("update")
      .limit(1);
    if (!before) return null;

    const [row] = await transaction
      .update(videos)
      .set({ ...values, updatedAt: new Date() })
      .where(and(eq(videos.id, id), isNull(videos.deletedAt)))
      .returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action,
      entityType: "video",
      entityId: id,
      beforeData: {
        contentStatus: before.contentStatus,
        featured: before.featured,
        processingStatus: before.processingStatus,
        title: before.title,
      },
      afterData: {
        contentStatus: row.contentStatus,
        featured: row.featured,
        processingStatus: row.processingStatus,
        title: row.title,
      },
    });
    return row;
  });
}

export async function softDeleteVideo(id: string, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction
      .select()
      .from(videos)
      .where(and(eq(videos.id, id), isNull(videos.deletedAt)))
      .for("update")
      .limit(1);
    if (!before) return null;
    const now = new Date();
    const [row] = await transaction
      .update(videos)
      .set({
        contentStatus: "archived",
        deletedAt: now,
        updatedAt: now,
      })
      .where(and(eq(videos.id, id), isNull(videos.deletedAt)))
      .returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "video.delete",
      entityType: "video",
      entityId: id,
      beforeData: {
        contentStatus: before.contentStatus,
        muxAssetId: before.muxAssetId,
      },
      afterData: { contentStatus: row.contentStatus, deletedAt: now.toISOString() },
    });
    return { before, row };
  });
}

export async function restoreVideoAfterProviderFailure(
  id: string,
  previousStatus: VideoRow["contentStatus"],
  actorProfileId: string,
) {
  return database.transaction(async (transaction) => {
    const [row] = await transaction
      .update(videos)
      .set({ contentStatus: previousStatus, deletedAt: null, updatedAt: new Date() })
      .where(and(eq(videos.id, id), isNotNull(videos.deletedAt)))
      .returning();
    if (!row) return null;
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "video.delete.rollback",
      entityType: "video",
      entityId: id,
      afterData: { contentStatus: row.contentStatus },
    });
    return row;
  });
}

export async function applyVideoWebhook(event: VerifiedVideoEvent) {
  return database.transaction(async (transaction) => {
    const inserted = await transaction
      .insert(videoWebhookEvents)
      .values({
        eventId: event.id,
        eventType: event.type,
        muxObjectId: event.objectId,
      })
      .onConflictDoNothing()
      .returning({ eventId: videoWebhookEvents.eventId });
    if (inserted.length === 0) return { outcome: "duplicate" as const };

    const identifiers = [
      event.videoId && uuidPattern.test(event.videoId) ? eq(videos.id, event.videoId) : undefined,
      event.uploadId ? eq(videos.muxUploadId, event.uploadId) : undefined,
      event.assetId ? eq(videos.muxAssetId, event.assetId) : undefined,
    ].filter((item) => item !== undefined);
    if (identifiers.length === 0) return { outcome: "unmatched" as const };

    const [before] = await transaction
      .select()
      .from(videos)
      .where(and(or(...identifiers), isNull(videos.deletedAt)))
      .for("update")
      .limit(1);
    if (!before) return { outcome: "unmatched" as const };

    const shouldKeepReady = before.processingStatus === "ready" && (
      event.status === "uploading" ||
      event.status === "processing" ||
      (event.status === "failed" && event.type.startsWith("video.upload."))
    );
    const processingStatus = shouldKeepReady || event.status === "ignored"
      ? before.processingStatus
      : event.status;
    const processingError = processingStatus === "failed"
      ? event.error ?? "Mux không thể xử lý video."
      : processingStatus === "ready"
        ? null
        : before.processingError;

    const [row] = await transaction
      .update(videos)
      .set({
        muxUploadId: event.uploadId ?? before.muxUploadId,
        muxAssetId: event.assetId ?? before.muxAssetId,
        muxPlaybackId: event.playbackId ?? before.muxPlaybackId,
        durationSeconds: event.duration === null ? before.durationSeconds : String(event.duration),
        aspectRatio: event.aspectRatio ?? before.aspectRatio,
        processingStatus,
        processingError,
        updatedAt: new Date(),
      })
      .where(eq(videos.id, before.id))
      .returning();
    return { outcome: "processed" as const, row };
  });
}
