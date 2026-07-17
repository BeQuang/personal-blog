import "server-only";

import { and, desc, eq, isNull, lte } from "drizzle-orm";

import { database } from "@/server/database/client";
import { videos } from "@/server/database/schema";

export type VideoRow = typeof videos.$inferSelect;
export type NewVideoRow = typeof videos.$inferInsert;

const videoRelations = { thumbnailMedia: true, videoMedia: true } as const;

export function findPublishedVideos(referenceDate = new Date()) {
  return database.query.videos.findMany({
    orderBy: [desc(videos.publishedAt), desc(videos.createdAt)],
    where: and(
      eq(videos.contentStatus, "published"),
      lte(videos.publishedAt, referenceDate),
      isNull(videos.deletedAt),
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
