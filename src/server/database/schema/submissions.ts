import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { campaigns } from "./campaigns";
import { newsletterStatusEnum, submissionStatusEnum } from "./enums";
import { mediaAssets } from "./media";

export type SubmissionUtm = Record<string, string>;

export const campaignSubmissions = pgTable(
  "campaign_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "restrict" }),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    emailNormalized: text("email_normalized").notNull(),
    phone: text("phone"),
    followedPlatform: text("followed_platform"),
    socialUsername: text("social_username"),
    notes: text("notes"),
    status: submissionStatusEnum("status").notNull().default("new"),
    source: text("source"),
    utm: jsonb("utm").$type<SubmissionUtm>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("campaign_submissions_campaign_email_unique_idx").on(
      table.campaignId,
      table.emailNormalized,
    ),
    index("campaign_submissions_campaign_status_created_idx").on(
      table.campaignId,
      table.status,
      table.createdAt.desc(),
    ),
    index("campaign_submissions_email_normalized_idx").on(table.emailNormalized),
    index("campaign_submissions_created_at_idx").on(table.createdAt.desc()),
  ],
).enableRLS();

export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    emailNormalized: text("email_normalized").notNull(),
    phone: text("phone"),
    company: text("company"),
    collaborationType: text("collaboration_type").notNull(),
    budgetRange: text("budget_range"),
    message: text("message").notNull(),
    attachmentMediaId: uuid("attachment_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    status: submissionStatusEnum("status").notNull().default("new"),
    source: text("source"),
    utm: jsonb("utm").$type<SubmissionUtm>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("contact_submissions_status_created_at_idx").on(table.status, table.createdAt.desc()),
    index("contact_submissions_email_normalized_idx").on(table.emailNormalized),
    index("contact_submissions_created_at_idx").on(table.createdAt.desc()),
  ],
).enableRLS();

export const newsletterSubscriptions = pgTable(
  "newsletter_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    emailNormalized: text("email_normalized").notNull(),
    status: newsletterStatusEnum("status").notNull().default("subscribed"),
    source: text("source"),
    unsubscribeTokenHash: text("unsubscribe_token_hash").notNull(),
    subscribedAt: timestamp("subscribed_at", { withTimezone: true }).notNull().defaultNow(),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("newsletter_subscriptions_email_unique_idx").on(table.emailNormalized),
    uniqueIndex("newsletter_subscriptions_token_hash_unique_idx").on(table.unsubscribeTokenHash),
    index("newsletter_subscriptions_status_idx").on(table.status),
    index("newsletter_subscriptions_created_at_idx").on(table.createdAt.desc()),
  ],
).enableRLS();
