import "server-only";

import { and, asc, count, desc, eq, ilike, isNull, lte, or } from "drizzle-orm";

import { database } from "@/server/database/client";
import { auditLogs, galleryItems } from "@/server/database/schema";
import type { AdminGalleryListQuery } from "@/types";

export type GalleryRow = typeof galleryItems.$inferSelect;
export type NewGalleryRow = typeof galleryItems.$inferInsert;
export type GalleryUpdate = Partial<Omit<NewGalleryRow, "id" | "createdAt">>;

const galleryRelations = { mediaAsset: true } as const;

export function findPublishedGalleryItems() {
  return database.query.galleryItems.findMany({
    orderBy: [asc(galleryItems.sortOrder), desc(galleryItems.createdAt)],
    where: and(
      eq(galleryItems.status, "published"),
      or(isNull(galleryItems.publishedAt), lte(galleryItems.publishedAt, new Date())),
      isNull(galleryItems.deletedAt),
    ),
    with: galleryRelations,
  });
}

export function findGalleryItems() {
  return database.query.galleryItems.findMany({
    orderBy: [asc(galleryItems.sortOrder), desc(galleryItems.createdAt)],
    where: isNull(galleryItems.deletedAt),
    with: galleryRelations,
  });
}

export async function findGalleryItemPage(query: AdminGalleryListQuery) {
  const offset = (query.page - 1) * query.pageSize;
  const where = and(
    isNull(galleryItems.deletedAt),
    query.category !== "all"
      ? eq(galleryItems.category, query.category)
      : undefined,
    query.query
      ? or(
          ilike(galleryItems.title, `%${query.query}%`),
          ilike(galleryItems.description, `%${query.query}%`),
          ilike(galleryItems.alt, `%${query.query}%`),
          ilike(galleryItems.category, `%${query.query}%`),
        )
      : undefined,
  );
  const sortColumn = {
    createdAt: galleryItems.createdAt,
    publishedAt: galleryItems.publishedAt,
    sortOrder: galleryItems.sortOrder,
    status: galleryItems.status,
    title: galleryItems.title,
    updatedAt: galleryItems.updatedAt,
  }[query.sortBy];
  const direction = query.sortOrder === "asc" ? asc : desc;
  const [items, totals] = await Promise.all([
    database.query.galleryItems.findMany({
      limit: query.pageSize,
      offset,
      orderBy: [direction(sortColumn), desc(galleryItems.createdAt), asc(galleryItems.id)],
      where,
      with: galleryRelations,
    }),
    database.select({ value: count() }).from(galleryItems).where(where),
  ]);
  return { items, total: totals[0]?.value ?? 0 };
}

export function findGalleryCategories(limit = 100) {
  return database
    .selectDistinct({ category: galleryItems.category })
    .from(galleryItems)
    .where(isNull(galleryItems.deletedAt))
    .orderBy(asc(galleryItems.category))
    .limit(limit);
}

export async function findGalleryItemById(id: string) {
  return database.query.galleryItems.findFirst({
    where: eq(galleryItems.id, id),
    with: galleryRelations,
  });
}

export async function createGalleryItem(values: NewGalleryRow, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [row] = await transaction.insert(galleryItems).values(values).returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "gallery.create",
      entityType: "gallery_item",
      entityId: row.id,
      afterData: { status: row.status, title: row.title, mediaAssetId: row.mediaAssetId },
    });
    return row;
  });
}

export async function updateGalleryItem(id: string, values: GalleryUpdate, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction.select().from(galleryItems)
      .where(and(eq(galleryItems.id, id), isNull(galleryItems.deletedAt))).limit(1);
    if (!before) return null;
    const [row] = await transaction.update(galleryItems)
      .set({ ...values, updatedAt: new Date() })
      .where(and(eq(galleryItems.id, id), isNull(galleryItems.deletedAt))).returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "gallery.update",
      entityType: "gallery_item",
      entityId: id,
      beforeData: { status: before.status, title: before.title },
      afterData: { status: row.status, title: row.title },
    });
    return row;
  });
}

export async function softDeleteGalleryItem(id: string, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction.select().from(galleryItems)
      .where(and(eq(galleryItems.id, id), isNull(galleryItems.deletedAt))).limit(1);
    if (!before) return null;
    const now = new Date();
    const [row] = await transaction.update(galleryItems)
      .set({ status: "archived", deletedAt: now, updatedAt: now })
      .where(eq(galleryItems.id, id)).returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "gallery.delete",
      entityType: "gallery_item",
      entityId: id,
      beforeData: { status: before.status, mediaAssetId: before.mediaAssetId },
      afterData: { status: row.status, deletedAt: now.toISOString() },
    });
    return row;
  });
}

export async function insertGalleryItemIfMissing(values: NewGalleryRow) {
  const existing = values.id ? await findGalleryItemById(values.id) : null;
  if (existing) return { operation: "skipped" as const, row: existing };

  const [row] = await database.insert(galleryItems).values(values).returning();
  return { operation: "inserted" as const, row };
}
