import { sql } from "drizzle-orm";
import {
  bigint,
  date,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export type AnalyticsMetadata = Record<string, unknown>;

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventType: text("event_type").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    path: text("path").notNull(),
    referrerDomain: text("referrer_domain"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    deviceCategory: text("device_category"),
    countryCode: text("country_code"),
    anonymousSessionHash: text("anonymous_session_hash"),
    metadata: jsonb("metadata")
      .$type<AnalyticsMetadata>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("analytics_events_event_type_created_at_idx").on(
      table.eventType,
      table.createdAt.desc(),
    ),
    index("analytics_events_entity_created_at_idx").on(
      table.entityType,
      table.entityId,
      table.createdAt.desc(),
    ),
    index("analytics_events_created_at_idx").on(table.createdAt.desc()),
    index("analytics_events_session_created_at_idx").on(
      table.anonymousSessionHash,
      table.createdAt.desc(),
    ),
  ],
).enableRLS();

export type AnalyticsDimensions = Record<string, string>;

export const dailyAnalytics = pgTable(
  "daily_analytics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date").notNull(),
    metric: text("metric").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    dimensions: jsonb("dimensions")
      .$type<AnalyticsDimensions>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    dimensionsHash: text("dimensions_hash").notNull(),
    value: bigint("value", { mode: "number" }).notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("daily_analytics_metric_dimensions_unique")
      .on(
        table.date,
        table.metric,
        table.entityType,
        table.entityId,
        table.dimensionsHash,
      )
      .nullsNotDistinct(),
    index("daily_analytics_date_metric_idx").on(table.date, table.metric),
    index("daily_analytics_entity_date_idx").on(
      table.entityType,
      table.entityId,
      table.date,
    ),
  ],
).enableRLS();
