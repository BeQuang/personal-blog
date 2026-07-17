import "server-only";

import { and, asc, eq, isNull, ne, sql } from "drizzle-orm";

import { database } from "@/server/database/client";
import { auditLogs, posts, postTags, tags } from "@/server/database/schema";

export type TagRow = typeof tags.$inferSelect;
export type NewTagRow = typeof tags.$inferInsert;

export function findTags() {
  return database.select().from(tags).orderBy(asc(tags.name));
}

export async function findTagBySlug(slug: string) {
  const [row] = await database
    .select()
    .from(tags)
    .where(sql`lower(${tags.slug}) = ${slug.toLowerCase()}`)
    .limit(1);

  return row ?? null;
}

export async function insertTagIfMissing(values: NewTagRow) {
  const existing = await findTagBySlug(values.slug);
  if (existing) return { operation: "skipped" as const, row: existing };

  const [row] = await database.insert(tags).values(values).returning();
  return { operation: "inserted" as const, row };
}

export async function findTagById(id: string) {
  const [row] = await database.select().from(tags).where(eq(tags.id, id)).limit(1);
  return row ?? null;
}

export async function findConflictingTagSlug(slug: string, excludedId?: string) {
  const [row] = await database
    .select({ id: tags.id })
    .from(tags)
    .where(
      and(
        sql`lower(${tags.slug}) = ${slug.toLowerCase()}`,
        excludedId ? ne(tags.id, excludedId) : undefined,
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function isTagUsedByNonDraftPost(id: string) {
  const [row] = await database
    .select({ id: posts.id })
    .from(postTags)
    .innerJoin(posts, eq(posts.id, postTags.postId))
    .where(
      and(
        eq(postTags.tagId, id),
        ne(posts.status, "draft"),
        isNull(posts.deletedAt),
      ),
    )
    .limit(1);

  return Boolean(row);
}

export async function createTag(values: NewTagRow, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [row] = await transaction.insert(tags).values(values).returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "tag.create",
      entityType: "tag",
      entityId: row.id,
      afterData: { name: row.name, slug: row.slug },
    });
    return row;
  });
}

export async function updateTag(id: string, values: Partial<NewTagRow>, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction.select().from(tags).where(eq(tags.id, id)).limit(1);
    if (!before) return null;
    const [row] = await transaction
      .update(tags)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(tags.id, id))
      .returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "tag.update",
      entityType: "tag",
      entityId: row.id,
      beforeData: { name: before.name, slug: before.slug },
      afterData: { name: row.name, slug: row.slug },
    });
    return row;
  });
}

export async function deleteTag(id: string, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [row] = await transaction.delete(tags).where(eq(tags.id, id)).returning();
    if (!row) return null;
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "tag.delete",
      entityType: "tag",
      entityId: row.id,
      beforeData: { name: row.name, slug: row.slug },
    });
    return row;
  });
}
