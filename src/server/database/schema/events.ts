import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { EventScheduleItem } from "@/types";

import { contentStatusEnum, eventStatusEnum, eventTypeEnum } from "./enums";
import { mediaAssets } from "./media";

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull(),
    bannerMediaId: uuid("banner_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    type: eventTypeEnum("type").notNull(),
    eventStatus: eventStatusEnum("event_status").notNull().default("upcoming"),
    contentStatus: contentStatusEnum("content_status").notNull().default("draft"),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }),
    timezone: text("timezone").notNull().default("Asia/Ho_Chi_Minh"),
    location: text("location"),
    platform: text("platform"),
    externalUrl: text("external_url"),
    schedule: jsonb("schedule")
      .$type<readonly EventScheduleItem[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    featured: boolean("featured").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("events_slug_unique_idx").on(sql`lower(${table.slug})`),
    index("events_content_status_start_at_idx").on(table.contentStatus, table.startAt),
    index("events_event_status_idx").on(table.eventStatus),
    index("events_type_idx").on(table.type),
    index("events_start_at_idx").on(table.startAt),
    index("events_created_at_idx").on(table.createdAt.desc()),
    check("events_end_after_start", sql`${table.endAt} is null or ${table.endAt} > ${table.startAt}`),
  ],
).enableRLS();
