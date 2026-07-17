import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
  ],
).enableRLS();
