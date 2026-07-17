import { sql } from "drizzle-orm";
import {
  boolean,
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

import { campaignStatusEnum } from "./enums";
import { mediaAssets } from "./media";

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull(),
    bannerMediaId: uuid("banner_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    status: campaignStatusEnum("status").notNull().default("draft"),
    buttonLabel: text("button_label").notNull(),
    buttonUrl: text("button_url"),
    rules: jsonb("rules")
      .$type<readonly string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    terms: jsonb("terms")
      .$type<readonly string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    featured: boolean("featured").notNull().default(false),
    submissionEnabled: boolean("submission_enabled").notNull().default(true),
    submissionLimit: integer("submission_limit"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("campaigns_slug_unique_idx").on(sql`lower(${table.slug})`),
    index("campaigns_status_start_end_idx").on(table.status, table.startAt, table.endAt),
    index("campaigns_start_at_idx").on(table.startAt),
    index("campaigns_end_at_idx").on(table.endAt),
    index("campaigns_featured_status_idx").on(table.featured, table.status),
    index("campaigns_created_at_idx").on(table.createdAt.desc()),
    check("campaigns_end_after_start", sql`${table.endAt} > ${table.startAt}`),
    check(
      "campaigns_submission_limit_positive",
      sql`${table.submissionLimit} is null or ${table.submissionLimit} > 0`,
    ),
  ],
).enableRLS();
