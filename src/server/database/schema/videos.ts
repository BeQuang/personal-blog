import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  contentStatusEnum,
  mediaStatusEnum,
  videoOrientationEnum,
  videoPlatformEnum,
} from "./enums";
import { mediaAssets } from "./media";

export const videos = pgTable(
  "videos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    platform: videoPlatformEnum("platform").notNull(),
    orientation: videoOrientationEnum("orientation").notNull(),
    topic: text("topic").notNull(),
    externalUrl: text("external_url"),
    thumbnailMediaId: uuid("thumbnail_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    videoMediaId: uuid("video_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    muxUploadId: text("mux_upload_id"),
    muxAssetId: text("mux_asset_id"),
    muxPlaybackId: text("mux_playback_id"),
    durationSeconds: numeric("duration_seconds", { precision: 12, scale: 3 }),
    aspectRatio: text("aspect_ratio"),
    processingStatus: mediaStatusEnum("processing_status").notNull().default("pending"),
    processingError: text("processing_error"),
    contentStatus: contentStatusEnum("content_status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    viewCount: bigint("view_count", { mode: "number" }).notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("videos_mux_upload_id_unique_idx")
      .on(table.muxUploadId)
      .where(sql`${table.muxUploadId} is not null`),
    uniqueIndex("videos_mux_asset_id_unique_idx")
      .on(table.muxAssetId)
      .where(sql`${table.muxAssetId} is not null`),
    uniqueIndex("videos_mux_playback_id_unique_idx")
      .on(table.muxPlaybackId)
      .where(sql`${table.muxPlaybackId} is not null`),
    index("videos_platform_content_status_idx").on(table.platform, table.contentStatus),
    index("videos_content_status_published_at_idx").on(
      table.contentStatus,
      table.publishedAt.desc(),
    ),
    index("videos_featured_content_status_idx").on(table.featured, table.contentStatus),
    index("videos_created_at_idx").on(table.createdAt.desc()),
    check("videos_duration_non_negative", sql`${table.durationSeconds} is null or ${table.durationSeconds} >= 0`),
    check("videos_view_count_non_negative", sql`${table.viewCount} >= 0`),
    check(
      "videos_external_url_required",
      sql`${table.platform} = 'internal' or ${table.externalUrl} is not null`,
    ),
  ],
).enableRLS();

export const videoWebhookEvents = pgTable(
  "video_webhook_events",
  {
    eventId: text("event_id").primaryKey(),
    eventType: text("event_type").notNull(),
    muxObjectId: text("mux_object_id"),
    processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("video_webhook_events_type_processed_at_idx").on(
      table.eventType,
      table.processedAt.desc(),
    ),
  ],
).enableRLS();
