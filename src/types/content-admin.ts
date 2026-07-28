import type { PostContentBlock } from "./post";
import type { SocialPlatform } from "./social";
import type { EventScheduleItem, EventStatus, EventType } from "./event";
import type { CampaignStatus } from "./campaign";
import type { HomepageSectionKey, NavigationItem, ThemeSettings } from "./site";

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

export type TaxonomyType = "category" | "tag";

export interface TaxonomyPage {
  items: readonly TaxonomyItem[];
  page: number;
  pageSize: number;
  total: number;
  sortBy: "name" | "slug" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
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

export interface AdminGalleryItem {
  id: string;
  mediaAssetId: string;
  imageUrl: string;
  title: string;
  caption: string | null;
  category: string;
  alt: string;
  sortOrder: number;
  status: AdminPostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryMutationInput {
  mediaAssetId: string;
  title: string;
  caption?: string | null;
  category: string;
  alt: string;
  sortOrder: number;
  status: AdminPostStatus;
  publishedAt?: string | null;
}

export interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  bannerMediaId: string | null;
  bannerUrl: string | null;
  type: EventType;
  eventStatus: EventStatus;
  contentStatus: AdminPostStatus;
  startAt: string;
  endAt: string | null;
  timezone: string;
  location: string | null;
  platform: string | null;
  externalUrl: string | null;
  schedule: readonly EventScheduleItem[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventMutationInput {
  title: string;
  slug?: string;
  description: string;
  bannerMediaId: string;
  type: EventType;
  eventStatus: EventStatus;
  contentStatus: AdminPostStatus;
  startAt: string;
  endAt?: string | null;
  timezone: string;
  location?: string | null;
  platform?: string | null;
  externalUrl?: string | null;
  schedule?: readonly EventScheduleItem[];
  featured: boolean;
}

export interface AdminCampaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  bannerMediaId: string | null;
  bannerUrl: string | null;
  startAt: string;
  endAt: string;
  status: CampaignStatus;
  buttonLabel: string;
  buttonUrl: string | null;
  rules: readonly string[];
  terms: readonly string[];
  featured: boolean;
  submissionEnabled: boolean;
  submissionLimit: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignMutationInput {
  title: string;
  slug?: string;
  description: string;
  bannerMediaId: string;
  startAt: string;
  endAt: string;
  status: CampaignStatus;
  buttonLabel: string;
  buttonUrl?: string | null;
  rules: readonly string[];
  terms: readonly string[];
  featured: boolean;
  submissionEnabled: boolean;
  submissionLimit?: number | null;
}

export interface SiteSettingsMutationInput {
  siteName: string;
  siteDescription: string;
  creatorName: string;
  username: string;
  contactEmail: string;
  avatarMediaId?: string | null;
  coverMediaId?: string | null;
  defaultSeoTitle?: string | null;
  defaultSeoDescription?: string | null;
  theme: ThemeSettings;
  homepageSections: Record<HomepageSectionKey, boolean>;
  navigation: readonly NavigationItem[];
}

export type ActionFieldErrors = Readonly<Record<string, readonly string[]>>;

export interface AdminActionResult {
  success: boolean;
  message: string;
  fieldErrors?: ActionFieldErrors;
}
