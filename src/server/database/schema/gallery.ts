import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { contentStatusEnum } from "./enums";
import { mediaAssets } from "./media";

export const galleryItems = pgTable(
  "gallery_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    mediaAssetId: uuid("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category").notNull(),
    alt: text("alt").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    status: contentStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("gallery_items_status_sort_order_idx").on(table.status, table.sortOrder),
    index("gallery_items_category_status_idx").on(table.category, table.status),
    index("gallery_items_published_at_idx").on(table.publishedAt.desc()),
    index("gallery_items_created_at_idx").on(table.createdAt.desc()),
    index("gallery_items_sort_order_idx").on(table.sortOrder),
  ],
).enableRLS();
