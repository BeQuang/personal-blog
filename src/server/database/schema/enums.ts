import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "admin",
  "editor",
  "viewer",
]);

export const profileStatusEnum = pgEnum("profile_status", ["active", "disabled"]);

export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "scheduled",
  "published",
  "archived",
]);

export const socialPlatformEnum = pgEnum("social_platform", [
  "facebook",
  "youtube",
  "tiktok",
  "instagram",
  "x",
  "threads",
  "zalo",
  "telegram",
  "discord",
  "website",
  "email",
]);

export const mediaTypeEnum = pgEnum("media_type", ["image", "document", "video"]);

export const mediaProviderEnum = pgEnum("media_provider", [
  "r2",
  "mux",
  "external",
  "local",
]);

export const mediaVisibilityEnum = pgEnum("media_visibility", ["public", "private"]);

export const mediaStatusEnum = pgEnum("media_status", [
  "pending",
  "uploading",
  "processing",
  "ready",
  "failed",
  "deleted",
]);

export const videoPlatformEnum = pgEnum("video_platform", [
  "youtube",
  "tiktok",
  "instagram",
  "facebook",
  "internal",
]);

export const videoOrientationEnum = pgEnum("video_orientation", ["landscape", "portrait"]);

export const eventStatusEnum = pgEnum("event_status", [
  "upcoming",
  "live",
  "ended",
  "cancelled",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "livestream",
  "premiere",
  "fan-meeting",
  "giveaway",
  "workshop",
  "offline",
  "launch",
]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "upcoming",
  "active",
  "ended",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "new",
  "read",
  "replied",
  "reviewing",
  "accepted",
  "rejected",
  "spam",
  "archived",
]);

export const newsletterStatusEnum = pgEnum("newsletter_status", [
  "subscribed",
  "unsubscribed",
  "suppressed",
]);
