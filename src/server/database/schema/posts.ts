import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { PostContentBlock } from "@/types";

import { contentStatusEnum } from "./enums";
import { mediaAssets } from "./media";
import { profiles } from "./profiles";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("categories_slug_unique_idx").on(sql`lower(${table.slug})`),
    index("categories_name_idx").on(table.name),
  ],
).enableRLS();

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("tags_slug_unique_idx").on(sql`lower(${table.slug})`),
    index("tags_name_idx").on(table.name),
  ],
).enableRLS();

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt").notNull(),
    content: jsonb("content").$type<readonly PostContentBlock[]>().notNull(),
    thumbnailMediaId: uuid("thumbnail_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    coverMediaId: uuid("cover_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    status: contentStatusEnum("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    readingTime: integer("reading_time").notNull().default(0),
    viewCount: bigint("view_count", { mode: "number" }).notNull().default(0),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("posts_slug_unique_idx").on(sql`lower(${table.slug})`),
    index("posts_status_published_at_idx").on(table.status, table.publishedAt.desc()),
    index("posts_featured_status_idx").on(table.featured, table.status),
    index("posts_category_id_idx").on(table.categoryId),
    index("posts_author_id_idx").on(table.authorId),
    index("posts_created_at_idx").on(table.createdAt.desc()),
    index("posts_updated_at_idx").on(table.updatedAt.desc()),
    check("posts_reading_time_non_negative", sql`${table.readingTime} >= 0`),
    check("posts_view_count_non_negative", sql`${table.viewCount} >= 0`),
    check(
      "posts_published_at_required",
      sql`${table.status} <> 'published' or ${table.publishedAt} is not null`,
    ),
    check(
      "posts_scheduled_at_required",
      sql`${table.status} <> 'scheduled' or ${table.scheduledAt} is not null`,
    ),
  ],
).enableRLS();

export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId], name: "post_tags_pk" }),
    index("post_tags_tag_id_idx").on(table.tagId),
  ],
).enableRLS();
