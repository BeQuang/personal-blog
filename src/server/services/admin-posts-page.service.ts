import "server-only";

import { requireAdminPagePermission } from "@/server/auth";
import { mapPostRowToAdminPost } from "@/server/mappers/posts.mapper";
import type { MediaOption, TaxonomyItem } from "@/types";

import { executeRepository } from "./service-helpers";

function mapTaxonomyItem(row: {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}): TaxonomyItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    ...(row.description ? { description: row.description } : {}),
  };
}

export async function getAdminPostsPageData() {
  const currentUser = await requireAdminPagePermission("content:view");
  const postsRepository = await import("@/server/repositories/posts.repository");
  const categoriesRepository = await import("@/server/repositories/categories.repository");
  const tagsRepository = await import("@/server/repositories/tags.repository");
  const mediaRepository = await import("@/server/repositories/media.repository");

  // Keep database work sequential. The production pool is intentionally small,
  // and issuing this page's relational reads concurrently can starve the pooler.
  const postRows = await executeRepository(() => postsRepository.findPosts());
  const categoryRows = await executeRepository(() => categoriesRepository.findCategories());
  const tagRows = await executeRepository(() => tagsRepository.findTags());
  const mediaRows = await executeRepository(() => mediaRepository.findAvailablePostMedia());

  const mediaOptions: MediaOption[] = mediaRows.flatMap((row) =>
    row.publicUrl
      ? [{
          id: row.id,
          label: row.originalFilename ?? row.alt ?? row.publicUrl,
          publicUrl: row.publicUrl,
        }]
      : [],
  );

  return {
    currentUser,
    posts: postRows.map(mapPostRowToAdminPost),
    categories: categoryRows.map(mapTaxonomyItem),
    tags: tagRows.map(mapTaxonomyItem),
    mediaOptions,
  };
}
