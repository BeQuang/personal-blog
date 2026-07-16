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

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const postTags = new Set(
    post.tags.map((tag) => tag.toLocaleLowerCase("vi-VN")),
  );

  const rankedPosts = getPublishedPosts()
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => {
      const sameCategory = candidate.category === post.category ? 2 : 0;
      const sharedTags = candidate.tags.filter((tag) =>
        postTags.has(tag.toLocaleLowerCase("vi-VN")),
      ).length;

      return { candidate, score: sameCategory + sharedTags };
    })
    .sort((left, right) => right.score - left.score);
  const directlyRelated = rankedPosts.filter(({ score }) => score > 0);
  const latestFallback = rankedPosts.filter(({ score }) => score === 0);

  return [...directlyRelated, ...latestFallback]
    .slice(0, Math.max(0, limit))
    .map(({ candidate }) => candidate);
}
