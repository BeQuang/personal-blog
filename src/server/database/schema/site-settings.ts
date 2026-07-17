import { sql } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import type {
  HomepageSectionKey,
  NavigationItem,
  ThemeSettings,
} from "@/types";

import { mediaAssets } from "./media";

export type HomepageContent = Record<string, unknown>;

export const siteSettings = pgTable(
  "site_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    settingsKey: text("settings_key").notNull().default("default"),
    siteName: text("site_name").notNull(),
    siteDescription: text("site_description").notNull(),
    locale: text("locale").notNull().default("vi-VN"),
    creatorName: text("creator_name").notNull(),
    username: text("username").notNull(),
    contactEmail: text("contact_email").notNull(),
    avatarMediaId: uuid("avatar_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    coverMediaId: uuid("cover_media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    theme: jsonb("theme").$type<ThemeSettings>().notNull(),
    homepageSections: jsonb("homepage_sections")
      .$type<Record<HomepageSectionKey, boolean>>()
      .notNull(),
    navigation: jsonb("navigation")
      .$type<readonly NavigationItem[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    homepageContent: jsonb("homepage_content")
      .$type<HomepageContent>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    defaultSeoTitle: text("default_seo_title"),
    defaultSeoDescription: text("default_seo_description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("site_settings_key_unique_idx").on(table.settingsKey)],
).enableRLS();
