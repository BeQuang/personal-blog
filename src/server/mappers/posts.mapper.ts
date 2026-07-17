import type { BlogPost, PostStatus } from "@/types";
import type { AdminPost } from "@/types";
import { siteConfig } from "@/config/site.config";

import { ValidationError } from "@/server/errors";
import type { findPublishedPosts } from "@/server/repositories/posts.repository";

import { toIsoString } from "./mapper-helpers";

type PostWithRelations = Awaited<ReturnType<typeof findPublishedPosts>>[number];

function toPostStatus(status: PostWithRelations["status"]): PostStatus {
  if (status === "archived") {
    throw new ValidationError("Archived posts cannot be mapped to the current public DTO");
  }

  return status;
}

export function mapPostRowToBlogPost(row: PostWithRelations): BlogPost {
  const thumbnail =
    row.thumbnailMedia?.publicUrl ?? row.coverMedia?.publicUrl ?? siteConfig.coverImage;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    thumbnail,
    ...(row.coverMedia?.publicUrl ? { coverImage: row.coverMedia.publicUrl } : {}),
    category: row.category.name,
    tags: row.postTags.map(({ tag }) => tag.name),
    author: { name: row.author.displayName },
    status: toPostStatus(row.status),
    featured: row.featured,
    readingTime: row.readingTime,
    viewCount: row.viewCount,
    ...(row.seoTitle ? { seoTitle: row.seoTitle } : {}),
    ...(row.seoDescription ? { seoDescription: row.seoDescription } : {}),
    ...(toIsoString(row.publishedAt) ? { publishedAt: toIsoString(row.publishedAt) } : {}),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapPostRowToAdminPost(row: PostWithRelations): AdminPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    status: row.status,
    featured: row.featured,
    readingTime: row.readingTime,
    categoryId: row.categoryId,
    categoryName: row.category.name,
    tagIds: row.postTags.map(({ tagId }) => tagId),
    tagNames: row.postTags.map(({ tag }) => tag.name),
    thumbnailMediaId: row.thumbnailMediaId,
    coverMediaId: row.coverMediaId,
    scheduledAt: toIsoString(row.scheduledAt) ?? null,
    publishedAt: toIsoString(row.publishedAt) ?? null,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
