import "server-only";

import { and, desc, eq, isNull, lte, ne, sql } from "drizzle-orm";

import { database } from "@/server/database/client";
import { auditLogs, posts, postTags, profiles } from "@/server/database/schema";

export type PostRow = typeof posts.$inferSelect;
export type NewPostRow = typeof posts.$inferInsert;

const postRelations = {
  author: true,
  category: true,
  coverMedia: true,
  postTags: { with: { tag: true } },
  thumbnailMedia: true,
} as const;

export function findPublishedPosts(referenceDate = new Date()) {
  return database.query.posts.findMany({
    orderBy: [desc(posts.publishedAt), desc(posts.createdAt)],
    where: and(
      eq(posts.status, "published"),
      lte(posts.publishedAt, referenceDate),
      isNull(posts.deletedAt),
    ),
    with: postRelations,
  });
}

export function findPosts() {
  return database.query.posts.findMany({
    orderBy: [desc(posts.createdAt)],
    where: isNull(posts.deletedAt),
    with: postRelations,
  });
}

export async function findPostById(id: string) {
  return database.query.posts.findFirst({
    where: and(eq(posts.id, id), isNull(posts.deletedAt)),
    with: postRelations,
  });
}

export async function findPostBySlug(slug: string, publishedOnly = false) {
  return database.query.posts.findFirst({
    where: and(
      sql`lower(${posts.slug}) = ${slug.toLowerCase()}`,
      isNull(posts.deletedAt),
      publishedOnly ? eq(posts.status, "published") : undefined,
      publishedOnly ? lte(posts.publishedAt, new Date()) : undefined,
    ),
    with: postRelations,
  });
}

export async function findConflictingPostSlug(slug: string, excludedId?: string) {
  const [row] = await database
    .select({ id: posts.id })
    .from(posts)
    .where(
      and(
        sql`lower(${posts.slug}) = ${slug.toLowerCase()}`,
        excludedId ? ne(posts.id, excludedId) : undefined,
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function createPost(
  values: NewPostRow,
  tagIds: readonly string[],
  actorProfileId: string,
) {
  return database.transaction(async (transaction) => {
    const [row] = await transaction.insert(posts).values(values).returning();
    if (tagIds.length > 0) {
      await transaction
        .insert(postTags)
        .values(tagIds.map((tagId) => ({ postId: row.id, tagId })));
    }
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "post.create",
      entityType: "post",
      entityId: row.id,
      afterData: { slug: row.slug, status: row.status, featured: row.featured },
    });
    return row;
  });
}

export async function updatePost(
  id: string,
  values: Partial<NewPostRow>,
  tagIds?: readonly string[],
  actorProfileId?: string,
  auditAction = "post.update",
) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction
      .select()
      .from(posts)
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .limit(1);
    if (!before) return null;

    const [row] = await transaction
      .update(posts)
      .set({ ...values, updatedAt: new Date() })
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .returning();

    if (!row) return null;

    if (tagIds) {
      await transaction.delete(postTags).where(eq(postTags.postId, id));
      if (tagIds.length > 0) {
        await transaction
          .insert(postTags)
          .values(tagIds.map((tagId) => ({ postId: id, tagId })));
      }
    }

    if (actorProfileId) {
      await transaction.insert(auditLogs).values({
        actorProfileId,
        action: auditAction,
        entityType: "post",
        entityId: row.id,
        beforeData: { slug: before.slug, status: before.status, featured: before.featured },
        afterData: { slug: row.slug, status: row.status, featured: row.featured },
      });
    }

    return row;
  });
}

export async function archivePost(id: string, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction
      .select()
      .from(posts)
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .limit(1);
    if (!before) return null;

    const [row] = await transaction
      .update(posts)
      .set({
        status: "archived",
        scheduledAt: null,
        publishedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();
    await transaction.insert(auditLogs).values({
      actorProfileId,
      action: "post.archive",
      entityType: "post",
      entityId: row.id,
      beforeData: { slug: before.slug, status: before.status },
      afterData: { slug: row.slug, status: row.status },
    });
    return row;
  });
}

export async function findSeedAuthor(email?: string) {
  const rows = await database
    .select()
    .from(profiles)
    .where(
      email
        ? and(
            eq(profiles.email, email),
            eq(profiles.role, "super_admin"),
            eq(profiles.status, "active"),
          )
        : and(eq(profiles.role, "super_admin"), eq(profiles.status, "active")),
    )
    .limit(1);

  if (rows[0] || !email) return rows[0] ?? null;

  const [fallback] = await database
    .select()
    .from(profiles)
    .where(and(eq(profiles.role, "super_admin"), eq(profiles.status, "active")))
    .limit(1);
  return fallback ?? null;
}

export async function insertPostIfMissing(
  values: NewPostRow,
  tagIds: readonly string[],
) {
  return database.transaction(async (transaction) => {
    const [existing] = await transaction
      .select()
      .from(posts)
      .where(sql`lower(${posts.slug}) = ${values.slug.toLowerCase()}`)
      .limit(1);
    const row = existing ?? (await transaction.insert(posts).values(values).returning())[0];

    const seedOwnsPost = !existing || existing.id === values.id;
    if (seedOwnsPost && tagIds.length > 0) {
      await transaction
        .insert(postTags)
        .values(tagIds.map((tagId) => ({ postId: row.id, tagId })))
        .onConflictDoNothing();
    }

    return { operation: existing ? ("skipped" as const) : ("inserted" as const), row };
  });
}
