import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { socialPlatformEnum } from "./enums";

export const socialLinks = pgTable(
  "social_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    platform: socialPlatformEnum("platform").notNull(),
    label: text("label").notNull(),
    username: text("username"),
    url: text("url").notNull(),
    followerCount: bigint("follower_count", { mode: "number" }),
    likesCount: bigint("likes_count", { mode: "number" }),
    externalId: text("external_id"),
    audienceSource: text("audience_source").notNull().default("manual"),
    audienceSyncStatus: text("audience_sync_status").notNull().default("manual"),
    audienceLastSyncedAt: timestamp("audience_last_synced_at", { withTimezone: true }),
    audienceSyncError: text("audience_sync_error"),
    description: text("description"),
    enabled: boolean("enabled").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("social_links_enabled_sort_order_idx").on(table.enabled, table.sortOrder),
    index("social_links_platform_idx").on(table.platform),
    index("social_links_follower_count_idx").on(table.followerCount),
    index("social_links_sort_order_idx").on(table.sortOrder),
    check(
      "social_links_follower_count_non_negative",
      sql`${table.followerCount} is null or ${table.followerCount} >= 0`,
    ),
    check(
      "social_links_likes_count_non_negative",
      sql`${table.likesCount} is null or ${table.likesCount} >= 0`,
    ),
    check(
      "social_links_audience_source_valid",
      sql`${table.audienceSource} in ('manual', 'youtube_api', 'tiktok_api', 'none')`,
    ),
    check(
      "social_links_audience_sync_status_valid",
      sql`${table.audienceSyncStatus} in ('manual', 'pending', 'synced', 'error', 'unavailable')`,
    ),
  ],
).enableRLS();

export const socialOauthConnections = pgTable(
  "social_oauth_connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    socialLinkId: uuid("social_link_id")
      .notNull()
      .references(() => socialLinks.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    accessTokenCiphertext: text("access_token_ciphertext").notNull(),
    refreshTokenCiphertext: text("refresh_token_ciphertext").notNull(),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }).notNull(),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }).notNull(),
    scopes: text("scopes").notNull(),
    connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("social_oauth_connections_social_link_unique").on(table.socialLinkId),
    index("social_oauth_connections_provider_idx").on(table.provider),
    check(
      "social_oauth_connections_provider_valid",
      sql`${table.provider} in ('tiktok')`,
    ),
  ],
).enableRLS();
