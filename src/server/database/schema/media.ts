import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { mediaProviderEnum, mediaStatusEnum, mediaTypeEnum, mediaVisibilityEnum } from "./enums";
import { profiles } from "./profiles";

export type MediaMetadata = Record<string, unknown>;

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: mediaTypeEnum("type").notNull(),
    provider: mediaProviderEnum("provider").notNull(),
    visibility: mediaVisibilityEnum("visibility").notNull().default("public"),
    status: mediaStatusEnum("status").notNull().default("pending"),
    objectKey: text("object_key"),
    publicUrl: text("public_url"),
    originalFilename: text("original_filename"),
    mimeType: text("mime_type").notNull(),
    extension: text("extension").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    width: integer("width"),
    height: integer("height"),
    alt: text("alt"),
    checksum: text("checksum"),
    metadata: jsonb("metadata")
      .$type<MediaMetadata>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    uploadedBy: uuid("uploaded_by").references(() => profiles.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("media_assets_object_key_unique_idx")
      .on(table.objectKey)
      .where(sql`${table.objectKey} is not null`),
    index("media_assets_type_status_idx").on(table.type, table.status),
    index("media_assets_provider_status_idx").on(table.provider, table.status),
    index("media_assets_uploaded_by_idx").on(table.uploadedBy),
    index("media_assets_created_at_idx").on(table.createdAt.desc()),
    check("media_assets_size_non_negative", sql`${table.sizeBytes} >= 0`),
    check("media_assets_width_positive", sql`${table.width} is null or ${table.width} > 0`),
    check("media_assets_height_positive", sql`${table.height} is null or ${table.height} > 0`),
  ],
).enableRLS();
