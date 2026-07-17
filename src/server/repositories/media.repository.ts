import "server-only";

import { and, asc, eq, isNotNull, isNull } from "drizzle-orm";

import { database } from "@/server/database/client";
import { mediaAssets } from "@/server/database/schema";

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

export async function insertMediaAssetIfMissing(values: NewMediaAssetRow) {
  const existing = values.objectKey
    ? await findMediaAssetByObjectKey(values.objectKey)
    : null;
  if (existing) return { operation: "skipped" as const, row: existing };

  const [row] = await database.insert(mediaAssets).values(values).returning();
  return { operation: "inserted" as const, row };
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
