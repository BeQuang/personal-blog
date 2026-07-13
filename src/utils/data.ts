import type { BlogPost, SocialLink } from "@/types";
import { toTimestamp } from "@/utils/date";

export function sortByDateDescending<T>(
  items: readonly T[],
  getDate: (item: T) => string | Date | undefined,
): T[] {
  return [...items].sort(
    (left, right) => toTimestamp(getDate(right)) - toTimestamp(getDate(left)),
  );
}

export function sortByDateAscending<T>(
  items: readonly T[],
  getDate: (item: T) => string | Date | undefined,
): T[] {
  return [...items].sort(
    (left, right) => toTimestamp(getDate(left)) - toTimestamp(getDate(right)),
  );
}

export function sortByOrder<T extends { order: number }>(
  items: readonly T[],
): T[] {
  return [...items].sort((left, right) => left.order - right.order);
}

export function filterPublishedPosts(posts: readonly BlogPost[]): BlogPost[] {
  return posts.filter(
    (post) => post.status === "published" && post.publishedAt,
  );
}

export function filterEnabledSocialLinks(
  links: readonly SocialLink[],
): SocialLink[] {
  return sortByOrder(links.filter((link) => link.enabled));
}

export function findBySlug<T extends { slug: string }>(
  items: readonly T[],
  slug: string,
): T | undefined {
  const normalizedSlug = slug.trim().toLocaleLowerCase("vi-VN");
  return items.find(
    (item) => item.slug.toLocaleLowerCase("vi-VN") === normalizedSlug,
  );
}
