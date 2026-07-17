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
    description: text("description"),
    enabled: boolean("enabled").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("social_links_enabled_sort_order_idx").on(table.enabled, table.sortOrder),
    index("social_links_platform_idx").on(table.platform),
    check(
      "social_links_follower_count_non_negative",
      sql`${table.followerCount} is null or ${table.followerCount} >= 0`,
    ),
  ],
).enableRLS();
