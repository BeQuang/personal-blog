import "server-only";

import { and, asc, count, desc, eq, isNull, ne, sql } from "drizzle-orm";

import { database } from "@/server/database/client";
import { auditLogs, categories, posts } from "@/server/database/schema";

export type CategoryRow = typeof categories.$inferSelect;
export type NewCategoryRow = typeof categories.$inferInsert;

export function findCategories() {
  return database.select().from(categories).orderBy(asc(categories.name));
}

export async function findCategoryPage(
  page: number,
  pageSize: number,
  sortBy: "name" | "slug" | "createdAt" | "updatedAt",
  sortOrder: "asc" | "desc",
) {
  const offset = (page - 1) * pageSize;
  const sortColumn = {
    createdAt: categories.createdAt,
    name: categories.name,
    slug: categories.slug,
    updatedAt: categories.updatedAt,
  }[sortBy];
  const direction = sortOrder === "asc" ? asc : desc;
  const [items, totals] = await Promise.all([
    database
      .select()
      .from(categories)
      .orderBy(direction(sortColumn), asc(categories.id))
      .limit(pageSize)
      .offset(offset),
    database.select({ value: count() }).from(categories),
  ]);

  return { items, total: totals[0]?.value ?? 0 };
}

export async function findCategoryBySlug(slug: string) {
  const [row] = await database
    .select()
    .from(categories)
    .where(sql`lower(${categories.slug}) = ${slug.toLowerCase()}`)
    .limit(1);

  return row ?? null;
}

export async function insertCategoryIfMissing(values: NewCategoryRow) {
  const existing = await findCategoryBySlug(values.slug);
  if (existing) return { operation: "skipped" as const, row: existing };

  const [row] = await database.insert(categories).values(values).returning();
  return { operation: "inserted" as const, row };
}

export async function findCategoryById(id: string) {
  const [row] = await database.select().from(categories).where(eq(categories.id, id)).limit(1);
  return row ?? null;
}

export async function findConflictingCategorySlug(slug: string, excludedId?: string) {
  const [row] = await database
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        sql`lower(${categories.slug}) = ${slug.toLowerCase()}`,
        excludedId ? ne(categories.id, excludedId) : undefined,
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function isCategoryUsedByNonDraftPost(id: string) {
  const [row] = await database
    .select({ id: posts.id })
    .from(posts)
    .where(
      and(
        eq(posts.categoryId, id),
        ne(posts.status, "draft"),
        isNull(posts.deletedAt),
      ),
    )
    .limit(1);

  return Boolean(row);
}

export async function createCategory(values: NewCategoryRow, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [row] = await transaction.insert(categories).values(values).returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "category.create",
      entityType: "category",
      entityId: row.id,
      afterData: { name: row.name, slug: row.slug },
    });
    return row;
  });
}

export async function updateCategory(id: string, values: Partial<NewCategoryRow>, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction.select().from(categories).where(eq(categories.id, id)).limit(1);
    if (!before) return null;
    const [row] = await transaction
      .update(categories)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "category.update",
      entityType: "category",
      entityId: row.id,
      beforeData: { name: before.name, slug: before.slug },
      afterData: { name: row.name, slug: row.slug },
    });
    return row;
  });
}

export async function deleteCategory(id: string, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [row] = await transaction.delete(categories).where(eq(categories.id, id)).returning();
    if (!row) return null;
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "category.delete",
      entityType: "category",
      entityId: row.id,
      beforeData: { name: row.name, slug: row.slug },
    });
    return row;
  });
}
