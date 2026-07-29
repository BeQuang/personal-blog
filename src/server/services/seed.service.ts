import "server-only";

import { createHash } from "node:crypto";
import path from "node:path";

import { z } from "zod";

import { campaigns } from "@/data/campaigns";
import { events } from "@/data/events";
import { galleryItems } from "@/data/gallery";
import { posts } from "@/data/posts";
import { socialLinks } from "@/data/social-links";
import { videos } from "@/data/videos";
import { homepageConfig } from "@/config/homepage.config";
import { siteConfig } from "@/config/site.config";
import { createSlug } from "@/server/domain/content-rules";
import { ValidationError } from "@/server/errors";
import type { PostContentBlock } from "@/types";

const dateString = z.iso.datetime();
const optionalString = z.string().trim().min(1).optional();
const postContentBlockSchema: z.ZodType<PostContentBlock> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), level: z.union([z.literal(2), z.literal(3)]), text: z.string().min(1) }),
  z.object({ type: z.literal("paragraph"), text: z.string().min(1) }),
  z.object({ type: z.literal("image"), src: z.string().min(1), alt: z.string().min(1), caption: optionalString }),
  z.object({ type: z.literal("quote"), text: z.string().min(1), attribution: optionalString }),
  z.object({ type: z.literal("list"), style: z.enum(["ordered", "unordered"]), items: z.array(z.string().min(1)).min(1) }),
  z.object({ type: z.literal("code"), language: z.string().min(1), code: z.string().min(1) }),
  z.object({ type: z.literal("video"), url: z.string().min(1), title: z.string().min(1) }),
  z.object({ type: z.literal("cta"), title: z.string().min(1), description: z.string().min(1), label: z.string().min(1), href: z.string().min(1) }),
  z.object({ type: z.literal("divider") }),
]);
const postSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  slug: z.string().min(1),
  excerpt: z.string().min(10),
  content: z.array(postContentBlockSchema).min(1),
  thumbnail: z.string().min(1),
  coverImage: optionalString,
  category: z.string().min(1),
  tags: z.array(z.string().min(1)),
  author: z.object({ name: z.string().min(1), avatar: optionalString }),
  status: z.enum(["draft", "published", "scheduled"]),
  featured: z.boolean(),
  readingTime: z.number().int().nonnegative(),
  viewCount: z.number().int().nonnegative().optional(),
  publishedAt: dateString.optional(),
  createdAt: dateString,
  updatedAt: dateString,
});
const socialLinkSchema = z.object({
  id: z.string().min(1),
  platform: z.enum(["facebook", "youtube", "tiktok", "instagram", "x", "threads", "zalo", "telegram", "discord", "website", "email"]),
  label: z.string().min(1),
  username: optionalString,
  url: z.string().min(1),
  followerCount: z.number().int().nonnegative().optional(),
  likesCount: z.number().int().nonnegative().optional(),
  description: optionalString,
  enabled: z.boolean(),
  order: z.number().int().nonnegative(),
});
const videoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  description: optionalString,
  platform: z.enum(["youtube", "tiktok", "instagram", "facebook", "internal"]),
  orientation: z.enum(["landscape", "portrait"]),
  thumbnail: z.string().min(1),
  videoUrl: z.string().min(1),
  duration: optionalString,
  viewCount: z.number().int().nonnegative().optional(),
  topic: z.string().min(1),
  featured: z.boolean(),
  publishedAt: dateString,
});
const gallerySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2),
  description: optionalString,
  imageUrl: z.string().min(1),
  thumbnailUrl: optionalString,
  category: z.string().min(1),
  alt: z.string().min(3),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  createdAt: dateString,
});
const eventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  slug: z.string().min(1),
  description: z.string().min(10),
  banner: z.string().min(1),
  type: z.enum(["livestream", "premiere", "fan-meeting", "giveaway", "workshop", "offline", "launch"]),
  status: z.enum(["upcoming", "live", "ended", "cancelled"]),
  startAt: dateString,
  endAt: dateString.optional(),
  location: optionalString,
  platform: optionalString,
  externalUrl: optionalString,
  schedule: z.array(z.object({ time: z.string().min(1), title: z.string().min(1) })).optional(),
  featured: z.boolean(),
});
const campaignSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  slug: z.string().min(1),
  description: z.string().min(10),
  banner: z.string().min(1),
  startAt: dateString,
  endAt: dateString,
  status: z.enum(["draft", "upcoming", "active", "ended"]),
  buttonLabel: z.string().min(1),
  buttonUrl: optionalString,
  rules: z.array(z.string().min(1)).min(1),
  terms: z.array(z.string().min(1)).min(1),
  featured: z.boolean(),
});

type SeedOperation = "inserted" | "skipped" | "updated";
type EntitySeedSummary = Record<SeedOperation, number>;
export interface SeedSummary {
  entities: Record<string, EntitySeedSummary>;
  normalizedLegacyRecords: number;
  validatedRecords: number;
  validationOnly: boolean;
}

function stableUuid(key: string) {
  const bytes = createHash("sha256").update(`personal-blog:${key}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function durationToSeconds(duration?: string) {
  if (!duration) return null;
  const parts = duration.split(":").map(Number);
  if (parts.some((part) => !Number.isInteger(part) || part < 0)) {
    throw new ValidationError(`Invalid video duration '${duration}'`);
  }
  const seconds = parts.reduce((total, part) => total * 60 + part, 0);
  return String(seconds);
}

function mediaDetails(url: string, type: "image" | "video") {
  const extension = path.extname(url).slice(1).toLowerCase() || (type === "image" ? "jpg" : "mp4");
  const mimeType = type === "image" ? `image/${extension === "jpg" ? "jpeg" : extension}` : `video/${extension}`;
  return { extension, mimeType };
}

function newEntitySummary(): EntitySeedSummary {
  return { inserted: 0, skipped: 0, updated: 0 };
}

function recordOperation(summary: SeedSummary, entity: string, operation: SeedOperation) {
  summary.entities[entity] ??= newEntitySummary();
  summary.entities[entity][operation] += 1;
}

function parseFixtures() {
  const fixtures = {
    campaigns: z.array(campaignSchema).parse(campaigns),
    events: z.array(eventSchema).parse(events),
    gallery: z.array(gallerySchema).parse(galleryItems),
    posts: z.array(postSchema).parse(posts),
    socialLinks: z.array(socialLinkSchema).parse(socialLinks),
    videos: z.array(videoSchema).parse(videos),
  };
  return fixtures;
}

export async function seedMockContent(options: { validationOnly?: boolean } = {}): Promise<SeedSummary> {
  const fixtures = parseFixtures();
  const summary: SeedSummary = {
    entities: {},
    normalizedLegacyRecords: fixtures.posts.filter((post) => post.status === "scheduled" && !post.publishedAt).length,
    validatedRecords: Object.values(fixtures).reduce((total, rows) => total + rows.length, 0),
    validationOnly: options.validationOnly ?? false,
  };
  if (summary.validationOnly) return summary;

  const [categoriesRepository, tagsRepository, mediaRepository, postsRepository, socialRepository, videosRepository, galleryRepository, eventsRepository, campaignsRepository, settingsRepository] = await Promise.all([
    import("@/server/repositories/categories.repository"),
    import("@/server/repositories/tags.repository"),
    import("@/server/repositories/media.repository"),
    import("@/server/repositories/posts.repository"),
    import("@/server/repositories/social-links.repository"),
    import("@/server/repositories/videos.repository"),
    import("@/server/repositories/gallery.repository"),
    import("@/server/repositories/events.repository"),
    import("@/server/repositories/campaigns.repository"),
    import("@/server/repositories/settings.repository"),
  ]);

  const imageDimensions = new Map<string, { width?: number; height?: number }>();
  for (const item of fixtures.gallery) {
    imageDimensions.set(item.imageUrl, { width: item.width, height: item.height });
  }
  const imageUrls = new Set<string>([
    siteConfig.avatar ?? "",
    siteConfig.coverImage ?? "",
    ...fixtures.posts.flatMap((post) => [post.thumbnail, post.coverImage ?? ""]),
    ...fixtures.videos.map((video) => video.thumbnail),
    ...fixtures.gallery.map((item) => item.imageUrl),
    ...fixtures.events.map((event) => event.banner),
    ...fixtures.campaigns.map((campaign) => campaign.banner),
  ].filter(Boolean));
  const mediaByUrl = new Map<string, { id: string }>();

  for (const url of imageUrls) {
    const details = mediaDetails(url, "image");
    const dimensions = imageDimensions.get(url);
    const result = await mediaRepository.insertMediaAssetIfMissing({
      id: stableUuid(`media:image:${url}`),
      type: "image",
      provider: url.startsWith("/") ? "local" : "external",
      visibility: "public",
      status: "ready",
      objectKey: `seed:image:${url}`,
      publicUrl: url,
      mimeType: details.mimeType,
      extension: details.extension,
      sizeBytes: 0,
      width: dimensions?.width,
      height: dimensions?.height,
      metadata: { seedSource: "src/data" },
    });
    mediaByUrl.set(url, result.row);
    recordOperation(summary, "media_assets", result.operation);
  }

  const internalVideoUrls = new Set(
    fixtures.videos.filter((video) => video.platform === "internal").map((video) => video.videoUrl),
  );
  for (const url of internalVideoUrls) {
    const details = mediaDetails(url, "video");
    const result = await mediaRepository.insertMediaAssetIfMissing({
      id: stableUuid(`media:video:${url}`),
      type: "video",
      provider: url.startsWith("/") ? "local" : "external",
      visibility: "public",
      status: "ready",
      objectKey: `seed:video:${url}`,
      publicUrl: url,
      mimeType: details.mimeType,
      extension: details.extension,
      sizeBytes: 0,
      metadata: { seedSource: "src/data" },
    });
    mediaByUrl.set(url, result.row);
    recordOperation(summary, "media_assets", result.operation);
  }

  const getMediaId = (url: string) => {
    const media = mediaByUrl.get(url);
    if (!media) throw new ValidationError(`Seed media '${url}' was not resolved`);
    return media.id;
  };

  const settingsResult = await settingsRepository.insertSiteSettingsIfMissing({
    id: stableUuid("settings:default"),
    settingsKey: "default",
    siteName: siteConfig.siteName,
    siteDescription: siteConfig.siteDescription,
    locale: siteConfig.locale,
    creatorName: siteConfig.creatorName,
    username: siteConfig.username,
    contactEmail: siteConfig.contactEmail,
    avatarMediaId: siteConfig.avatar ? getMediaId(siteConfig.avatar) : null,
    coverMediaId: siteConfig.coverImage ? getMediaId(siteConfig.coverImage) : null,
    theme: siteConfig.theme,
    homepageSections: siteConfig.homepageSections,
    navigation: siteConfig.navigation,
    homepageContent: homepageConfig,
    defaultSeoTitle: siteConfig.siteName,
    defaultSeoDescription: siteConfig.siteDescription,
  });
  recordOperation(summary, "site_settings", settingsResult.operation);

  for (const link of fixtures.socialLinks) {
    const result = await socialRepository.insertSocialLinkIfMissing({
      id: stableUuid(`social:${link.id}`),
      platform: link.platform,
      label: link.label,
      username: link.username,
      url: link.url,
      followerCount: link.followerCount,
      likesCount: link.likesCount,
      description: link.description,
      enabled: link.enabled,
      sortOrder: link.order,
    });
    recordOperation(summary, "social_links", result.operation);
  }

  const categoryByName = new Map<string, string>();
  for (const categoryName of new Set(fixtures.posts.map((post) => post.category))) {
    const slug = createSlug(categoryName);
    const result = await categoriesRepository.insertCategoryIfMissing({
      id: stableUuid(`category:${slug}`),
      name: categoryName,
      slug,
    });
    categoryByName.set(categoryName, result.row.id);
    recordOperation(summary, "categories", result.operation);
  }

  const tagByName = new Map<string, string>();
  for (const tagName of new Set(fixtures.posts.flatMap((post) => post.tags))) {
    const slug = createSlug(tagName);
    const result = await tagsRepository.insertTagIfMissing({
      id: stableUuid(`tag:${slug}`),
      name: tagName,
      slug,
    });
    tagByName.set(tagName, result.row.id);
    recordOperation(summary, "tags", result.operation);
  }

  const author = await postsRepository.findSeedAuthor(process.env.BOOTSTRAP_ADMIN_EMAIL);
  if (!author) {
    throw new ValidationError("Seed requires an active super_admin profile for post ownership");
  }

  for (const post of fixtures.posts) {
    const categoryId = categoryByName.get(post.category);
    const tagIds = post.tags.map((tag) => tagByName.get(tag)).filter((id): id is string => Boolean(id));
    if (!categoryId || tagIds.length !== post.tags.length) {
      throw new ValidationError(`Post '${post.slug}' has unresolved category or tags`);
    }
    const status = post.status === "scheduled" && !post.publishedAt ? "draft" : post.status;
    const result = await postsRepository.insertPostIfMissing({
      id: stableUuid(`post:${post.id}`),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      thumbnailMediaId: getMediaId(post.thumbnail),
      coverMediaId: post.coverImage ? getMediaId(post.coverImage) : null,
      categoryId,
      authorId: author.id,
      status,
      featured: post.featured,
      readingTime: post.readingTime,
      viewCount: post.viewCount ?? 0,
      publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.updatedAt),
    }, tagIds);
    recordOperation(summary, "posts", result.operation);
  }

  for (const video of fixtures.videos) {
    const result = await videosRepository.insertVideoIfMissing({
      id: stableUuid(`video:${video.id}`),
      title: video.title,
      description: video.description,
      platform: video.platform,
      orientation: video.orientation,
      topic: video.topic,
      externalUrl: video.platform === "internal" ? null : video.videoUrl,
      thumbnailMediaId: getMediaId(video.thumbnail),
      videoMediaId: video.platform === "internal" ? getMediaId(video.videoUrl) : null,
      durationSeconds: durationToSeconds(video.duration),
      processingStatus: "ready",
      contentStatus: "published",
      featured: video.featured,
      viewCount: video.viewCount ?? 0,
      publishedAt: new Date(video.publishedAt),
    });
    recordOperation(summary, "videos", result.operation);
  }

  for (const [index, item] of fixtures.gallery.entries()) {
    const result = await galleryRepository.insertGalleryItemIfMissing({
      id: stableUuid(`gallery:${item.id}`),
      mediaAssetId: getMediaId(item.imageUrl),
      title: item.title,
      description: item.description,
      category: item.category,
      alt: item.alt,
      sortOrder: index,
      status: "published",
      publishedAt: new Date(item.createdAt),
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.createdAt),
    });
    recordOperation(summary, "gallery_items", result.operation);
  }

  for (const event of fixtures.events) {
    const result = await eventsRepository.insertEventIfMissing({
      id: stableUuid(`event:${event.id}`),
      title: event.title,
      slug: event.slug,
      description: event.description,
      bannerMediaId: getMediaId(event.banner),
      type: event.type,
      eventStatus: event.status,
      contentStatus: "published",
      startAt: new Date(event.startAt),
      endAt: event.endAt ? new Date(event.endAt) : null,
      location: event.location,
      platform: event.platform,
      externalUrl: event.externalUrl,
      schedule: event.schedule ?? [],
      featured: event.featured,
    });
    recordOperation(summary, "events", result.operation);
  }

  for (const campaign of fixtures.campaigns) {
    const result = await campaignsRepository.insertCampaignIfMissing({
      id: stableUuid(`campaign:${campaign.id}`),
      title: campaign.title,
      slug: campaign.slug,
      description: campaign.description,
      bannerMediaId: getMediaId(campaign.banner),
      startAt: new Date(campaign.startAt),
      endAt: new Date(campaign.endAt),
      status: campaign.status,
      buttonLabel: campaign.buttonLabel,
      buttonUrl: campaign.buttonUrl,
      rules: campaign.rules,
      terms: campaign.terms,
      featured: campaign.featured,
    });
    recordOperation(summary, "campaigns", result.operation);
  }

  return summary;
}
