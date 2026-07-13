import { posts } from "@/data/posts";
import type { BlogPost } from "@/types";
import {
  filterPublishedPosts,
  findBySlug,
  sortByDateDescending,
} from "@/utils/data";

export function getPublishedPosts(): BlogPost[] {
  return sortByDateDescending(
    filterPublishedPosts(posts),
    (post) => post.publishedAt ?? post.createdAt,
  );
}

export function getFeaturedPosts(limit?: number): BlogPost[] {
  const featuredPosts = getPublishedPosts().filter((post) => post.featured);
  return limit === undefined ? featuredPosts : featuredPosts.slice(0, limit);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return findBySlug(getPublishedPosts(), slug);
}

export function getPostsByCategory(category: string): BlogPost[] {
  const normalizedCategory = category.trim().toLocaleLowerCase("vi-VN");
  return getPublishedPosts().filter(
    (post) => post.category.toLocaleLowerCase("vi-VN") === normalizedCategory,
  );
}
