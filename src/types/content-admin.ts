import type { PostContentBlock } from "./post";
import type { SocialPlatform } from "./social";

export type AdminPostStatus = "draft" | "scheduled" | "published" | "archived";

export interface AdminPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: readonly PostContentBlock[];
  status: AdminPostStatus;
  featured: boolean;
  readingTime: number;
  categoryId: string;
  categoryName: string;
  tagIds: readonly string[];
  tagNames: readonly string[];
  thumbnailMediaId: string | null;
  coverMediaId: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaxonomyItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface MediaOption {
  id: string;
  label: string;
  publicUrl: string;
}

export interface PostMutationInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: readonly PostContentBlock[];
  status: AdminPostStatus;
  featured: boolean;
  readingTime: number;
  categoryId: string;
  tagIds: readonly string[];
  thumbnailMediaId?: string | null;
  coverMediaId?: string | null;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface TaxonomyMutationInput {
  name: string;
  slug?: string;
  description?: string | null;
}

export interface SocialLinkMutationInput {
  platform: SocialPlatform;
  label: string;
  username?: string | null;
  url: string;
  followerCount?: number | null;
  description?: string | null;
  enabled: boolean;
  order: number;
}

export type ActionFieldErrors = Readonly<Record<string, readonly string[]>>;

export interface AdminActionResult {
  success: boolean;
  message: string;
  fieldErrors?: ActionFieldErrors;
}
