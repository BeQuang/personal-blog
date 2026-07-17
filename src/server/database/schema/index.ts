import { relations } from "drizzle-orm";

import { auditLogs } from "./audit-logs";
import { campaigns } from "./campaigns";
import { events } from "./events";
import { galleryItems } from "./gallery";
import { mediaAssets } from "./media";
import { categories, posts, postTags, tags } from "./posts";
import { profiles } from "./profiles";
import { siteSettings } from "./site-settings";
import { campaignSubmissions, contactSubmissions } from "./submissions";
import { videos } from "./videos";

export * from "./analytics";
export * from "./audit-logs";
export * from "./campaigns";
export * from "./enums";
export * from "./events";
export * from "./gallery";
export * from "./media";
export * from "./posts";
export * from "./profiles";
export * from "./site-settings";
export * from "./social-links";
export * from "./submissions";
export * from "./videos";

export const profilesRelations = relations(profiles, ({ many }) => ({
  posts: many(posts),
  mediaAssets: many(mediaAssets),
  auditLogs: many(auditLogs),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one }) => ({
  uploader: one(profiles, {
    fields: [mediaAssets.uploadedBy],
    references: [profiles.id],
  }),
}));

export const siteSettingsRelations = relations(siteSettings, ({ one }) => ({
  avatarMedia: one(mediaAssets, {
    fields: [siteSettings.avatarMediaId],
    references: [mediaAssets.id],
    relationName: "site_settings_avatar_media",
  }),
  coverMedia: one(mediaAssets, {
    fields: [siteSettings.coverMediaId],
    references: [mediaAssets.id],
    relationName: "site_settings_cover_media",
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const postsRelations = relations(posts, ({ many, one }) => ({
  author: one(profiles, {
    fields: [posts.authorId],
    references: [profiles.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  thumbnailMedia: one(mediaAssets, {
    fields: [posts.thumbnailMediaId],
    references: [mediaAssets.id],
    relationName: "posts_thumbnail_media",
  }),
  coverMedia: one(mediaAssets, {
    fields: [posts.coverMediaId],
    references: [mediaAssets.id],
    relationName: "posts_cover_media",
  }),
  postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const videosRelations = relations(videos, ({ one }) => ({
  thumbnailMedia: one(mediaAssets, {
    fields: [videos.thumbnailMediaId],
    references: [mediaAssets.id],
    relationName: "videos_thumbnail_media",
  }),
  videoMedia: one(mediaAssets, {
    fields: [videos.videoMediaId],
    references: [mediaAssets.id],
    relationName: "videos_video_media",
  }),
}));

export const galleryItemsRelations = relations(galleryItems, ({ one }) => ({
  mediaAsset: one(mediaAssets, {
    fields: [galleryItems.mediaAssetId],
    references: [mediaAssets.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  bannerMedia: one(mediaAssets, {
    fields: [events.bannerMediaId],
    references: [mediaAssets.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ many, one }) => ({
  bannerMedia: one(mediaAssets, {
    fields: [campaigns.bannerMediaId],
    references: [mediaAssets.id],
  }),
  submissions: many(campaignSubmissions),
}));

export const campaignSubmissionsRelations = relations(campaignSubmissions, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignSubmissions.campaignId],
    references: [campaigns.id],
  }),
}));

export const contactSubmissionsRelations = relations(contactSubmissions, ({ one }) => ({
  attachmentMedia: one(mediaAssets, {
    fields: [contactSubmissions.attachmentMediaId],
    references: [mediaAssets.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(profiles, {
    fields: [auditLogs.actorProfileId],
    references: [profiles.id],
  }),
}));
