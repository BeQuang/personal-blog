import "server-only";

import { and, asc, desc, eq, isNull } from "drizzle-orm";

import { database } from "@/server/database/client";
import { galleryItems } from "@/server/database/schema";

export type GalleryRow = typeof galleryItems.$inferSelect;
export type NewGalleryRow = typeof galleryItems.$inferInsert;

export function findPublishedGalleryItems() {
  return database.query.galleryItems.findMany({
    orderBy: [asc(galleryItems.sortOrder), desc(galleryItems.createdAt)],
    where: and(eq(galleryItems.status, "published"), isNull(galleryItems.deletedAt)),
    with: { mediaAsset: true },
  });
}

export async function findGalleryItemById(id: string) {
  return database.query.galleryItems.findFirst({
    where: eq(galleryItems.id, id),
    with: { mediaAsset: true },
  });
}

export async function insertGalleryItemIfMissing(values: NewGalleryRow) {
  const existing = values.id ? await findGalleryItemById(values.id) : null;
  if (existing) return { operation: "skipped" as const, row: existing };

  const [row] = await database.insert(galleryItems).values(values).returning();
  return { operation: "inserted" as const, row };
}
