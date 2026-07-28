import "server-only";

import { z } from "zod";

import { posts as mockPosts } from "@/data/posts";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/server/errors";
import {
  mapPostRowToAdminPost,
  mapPostRowToBlogPost,
} from "@/server/mappers/posts.mapper";
import {
  adminListPageSchema,
  parseAdminListQuery,
} from "@/server/validation/admin-list.validation";
import { parsePostMutationInput } from "@/server/validation/posts.validation";
import type {
  AdminListPage,
  AdminPost,
  AdminPostListQuery,
  BlogPost,
  MediaOption,
  PostMutationInput,
} from "@/types";

import { getContentSource } from "./content-source";
import {
  createSlug,
  executeRepository,
  parseSlug,
} from "./service-helpers";

const idSchema = z.uuid("ID không hợp lệ");
const adminPostListQuerySchema = adminListPageSchema.extend({
  query: z.string().trim().max(200).default(""),
  status: z.enum(["all", "draft", "scheduled", "published"]).default("all"),
  includeArchived: z.preprocess(
    (value) => value === "true" ? true : value === "false" ? false : value,
    z.boolean().default(false),
  ),
  sortBy: z
    .enum(["createdAt", "publishedAt", "status", "title", "updatedAt"])
    .default("updatedAt"),
});

function normalizeMockPost(post: BlogPost): BlogPost {
  return { ...post };
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  if (getContentSource() === "mock") {
    return mockPosts
      .filter((post) => post.status === "published")
      .map(normalizeMockPost)
      .sort(
        (left, right) =>
          new Date(right.publishedAt ?? right.createdAt).getTime() -
          new Date(left.publishedAt ?? left.createdAt).getTime(),
      );
  }

  const { findPublishedPosts } = await import("@/server/repositories/posts.repository");
  return executeRepository(async () => (await findPublishedPosts()).map(mapPostRowToBlogPost));
}

export async function getFeaturedPosts(limit?: number) {
  const featuredPosts = (await getPublishedPosts()).filter((post) => post.featured);
  return limit === undefined ? featuredPosts : featuredPosts.slice(0, Math.max(0, limit));
}

export async function getPostsByCategory(category: string) {
  const normalizedCategory = category.trim().toLocaleLowerCase("vi-VN");
  return (await getPublishedPosts()).filter(
    (post) => post.category.toLocaleLowerCase("vi-VN") === normalizedCategory,
  );
}

export async function getRelatedPosts(post: BlogPost, limit = 3) {
  const postTags = new Set(post.tags.map((tag) => tag.toLocaleLowerCase("vi-VN")));
  return (await getPublishedPosts())
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => ({
      candidate,
      score:
        (candidate.category === post.category ? 2 : 0) +
        candidate.tags.filter((tag) => postTags.has(tag.toLocaleLowerCase("vi-VN"))).length,
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(0, limit))
    .map(({ candidate }) => candidate);
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const normalizedSlug = parseSlug(slug);

  if (getContentSource() === "mock") {
    return mockPosts.map(normalizeMockPost).find(
      (post) => post.status === "published" && post.slug === normalizedSlug,
    );
  }

  const { findPostBySlug } = await import("@/server/repositories/posts.repository");
  return executeRepository(async () => {
    const row = await findPostBySlug(normalizedSlug, true);
    return row ? mapPostRowToBlogPost(row) : undefined;
  });
}

export async function getPostBySlug(slug: string) {
  return getPublishedPostBySlug(slug);
}

export async function requirePublishedPostBySlug(slug: string) {
  const post = await getPublishedPostBySlug(slug);
  if (!post) throw new NotFoundError("Post", slug);
  return post;
}

export async function getAdminPosts(): Promise<AdminPost[]> {
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission("content:view");
  const { findPosts } = await import("@/server/repositories/posts.repository");
  return executeRepository(async () => (await findPosts()).map(mapPostRowToAdminPost));
}

export async function getAdminPostPage(
  input: unknown,
): Promise<AdminListPage<AdminPost, AdminPostListQuery["sortBy"]>> {
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission("content:view");
  const query = parseAdminListQuery(
    adminPostListQuerySchema,
    input,
    "Bộ lọc bài viết chưa hợp lệ",
  ) as AdminPostListQuery;
  const repository = await import("@/server/repositories/posts.repository");
  const result = await executeRepository(() => repository.findPostPage(query));
  return {
    items: result.items.map(mapPostRowToAdminPost),
    total: result.total,
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };
}

export async function getPostMediaOptions(): Promise<MediaOption[]> {
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission("content:view");
  const { findAvailablePostMedia } = await import("@/server/repositories/media.repository");
  return executeRepository(async () =>
    (await findAvailablePostMedia()).flatMap((row) =>
      row.publicUrl
        ? [{
            id: row.id,
            label: row.originalFilename ?? row.alt ?? row.publicUrl,
            publicUrl: row.publicUrl,
          }]
        : [],
    ),
  );
}

async function parsePostMutation(
  input: PostMutationInput,
  existing?: AdminPost,
) {
  const { requireServicePermission } = await import("./service-authorization");
  const currentUser = await requireServicePermission("content:write");
  const parsed = parsePostMutationInput(input);
  const needsPublishPermission =
    parsed.status !== "draft" || (existing && existing.status !== "draft");
  if (needsPublishPermission) await requireServicePermission("content:publish");

  const now = new Date();
  let scheduledAt = parsed.scheduledAt;
  let publishedAt = parsed.publishedAt;

  if (parsed.status === "scheduled") {
    if (!scheduledAt || scheduledAt <= now) {
      throw new ValidationError("Lịch xuất bản chưa hợp lệ", {
        scheduledAt: ["Thời gian lên lịch phải ở tương lai"],
      });
    }
    publishedAt = null;
  } else {
    scheduledAt = null;
  }

  if (parsed.status === "published") {
    publishedAt ??= now;
    if (publishedAt > now) {
      throw new ValidationError("Thời gian xuất bản chưa hợp lệ", {
        publishedAt: ["Hãy dùng trạng thái lên lịch cho thời gian trong tương lai"],
      });
    }
  } else {
    publishedAt = null;
  }

  const slug = parsed.slug ? parseSlug(parsed.slug) : createSlug(parsed.title);

  const categoriesRepository = await import("@/server/repositories/categories.repository");
  const tagsRepository = await import("@/server/repositories/tags.repository");
  const mediaRepository = await import("@/server/repositories/media.repository");
  const postsRepository = await import("@/server/repositories/posts.repository");

  const [category, conflictingSlug, selectedTags, thumbnailMedia, coverMedia] = await Promise.all([
    categoriesRepository.findCategoryById(parsed.categoryId),
    postsRepository.findConflictingPostSlug(slug, existing?.id),
    Promise.all(parsed.tagIds.map((id) => tagsRepository.findTagById(id))),
    parsed.thumbnailMediaId
      ? mediaRepository.findMediaAssetById(parsed.thumbnailMediaId)
      : null,
    parsed.coverMediaId
      ? mediaRepository.findMediaAssetById(parsed.coverMediaId)
      : null,
  ]);

  if (!category) {
    throw new ValidationError("Danh mục không tồn tại", {
      categoryId: ["Vui lòng chọn lại danh mục"],
    });
  }
  if (conflictingSlug) {
    throw new ConflictError("Slug bài viết đã tồn tại");
  }
  if (selectedTags.some((tag) => !tag)) {
    throw new ValidationError("Một hoặc nhiều thẻ không tồn tại", {
      tagIds: ["Vui lòng chọn lại danh sách thẻ"],
    });
  }

  for (const [field, media] of [
    ["thumbnailMediaId", thumbnailMedia],
    ["coverMediaId", coverMedia],
  ] as const) {
    if (media && (
      media.type !== "image" ||
      media.status !== "ready" ||
      media.visibility !== "public" ||
      !media.publicUrl ||
      media.deletedAt
    )) {
      throw new ValidationError("Media không thể dùng cho bài viết", {
        [field]: ["Chỉ được chọn ảnh public ở trạng thái sẵn sàng"],
      });
    }
  }

  return {
    currentUser,
    tagIds: parsed.tagIds,
    values: {
      title: parsed.title,
      slug,
      excerpt: parsed.excerpt,
      content: parsed.content,
      status: parsed.status,
      featured: parsed.featured,
      readingTime: parsed.readingTime,
      categoryId: parsed.categoryId,
      thumbnailMediaId: parsed.thumbnailMediaId ?? null,
      coverMediaId: parsed.coverMediaId ?? null,
      scheduledAt,
      publishedAt,
      seoTitle: parsed.seoTitle,
      seoDescription: parsed.seoDescription,
    },
  };
}

export async function createPost(input: PostMutationInput) {
  const prepared = await parsePostMutation(input);
  const postsRepository = await import("@/server/repositories/posts.repository");
  const row = await executeRepository(() =>
    postsRepository.createPost(
      { ...prepared.values, authorId: prepared.currentUser.id },
      prepared.tagIds,
      prepared.currentUser.id,
    ),
  );
  return { id: row.id, slug: row.slug };
}

export async function updatePost(id: string, input: PostMutationInput) {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) throw new ValidationError("ID bài viết không hợp lệ", { id: ["ID không hợp lệ"] });

  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission("content:write");
  const postsRepository = await import("@/server/repositories/posts.repository");
  const existingRow = await executeRepository(() => postsRepository.findPostById(parsedId.data));
  if (!existingRow) throw new NotFoundError("Post", id);
  const existing = mapPostRowToAdminPost(existingRow);
  const prepared = await parsePostMutation(input, existing);
  const row = await executeRepository(() =>
    postsRepository.updatePost(
      parsedId.data,
      prepared.values,
      prepared.tagIds,
      prepared.currentUser.id,
    ),
  );
  if (!row) throw new NotFoundError("Post", id);
  return { id: row.id, slug: row.slug };
}

export async function setPostStatus(id: string, status: "draft" | "published") {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) throw new ValidationError("ID bài viết không hợp lệ", { id: ["ID không hợp lệ"] });
  const { requireServicePermission } = await import("./service-authorization");
  const currentUser = await requireServicePermission("content:publish");
  const postsRepository = await import("@/server/repositories/posts.repository");
  const existing = await executeRepository(() => postsRepository.findPostById(parsedId.data));
  if (!existing) throw new NotFoundError("Post", id);
  const row = await executeRepository(() =>
    postsRepository.updatePost(parsedId.data, {
      status,
      scheduledAt: null,
      publishedAt: status === "published" ? new Date() : null,
    }, undefined, currentUser.id, status === "published" ? "post.publish" : "post.unpublish"),
  );
  if (!row) throw new NotFoundError("Post", id);
  return { id: row.id, slug: row.slug };
}

export async function setPostFeatured(id: string, featured: boolean) {
  const parsed = z.object({ id: idSchema, featured: z.boolean() }).safeParse({ id, featured });
  if (!parsed.success) throw new ValidationError("Dữ liệu nổi bật không hợp lệ", parsed.error.flatten().fieldErrors);
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission("content:write");
  const postsRepository = await import("@/server/repositories/posts.repository");
  const existing = await executeRepository(() => postsRepository.findPostById(parsed.data.id));
  if (!existing) throw new NotFoundError("Post", id);
  const currentUser = await requireServicePermission(existing.status === "draft" ? "content:write" : "content:publish");
  const row = await executeRepository(() =>
    postsRepository.updatePost(
      parsed.data.id,
      { featured: parsed.data.featured },
      undefined,
      currentUser.id,
      "post.featured.update",
    ),
  );
  if (!row) throw new NotFoundError("Post", id);
  return { id: row.id };
}

export async function archivePost(id: string) {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) throw new ValidationError("ID bài viết không hợp lệ", { id: ["ID không hợp lệ"] });
  const { requireServicePermission } = await import("./service-authorization");
  const currentUser = await requireServicePermission("content:publish");
  const postsRepository = await import("@/server/repositories/posts.repository");
  const row = await executeRepository(() => postsRepository.archivePost(parsedId.data, currentUser.id));
  if (!row) throw new NotFoundError("Post", id);
  return { id: row.id, slug: row.slug };
}

// Kept for Stage 14 callers that only need validation and authorization.
export async function preparePostMutation(input: PostMutationInput) {
  return parsePostMutation(input);
}
