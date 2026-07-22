import "server-only";

import { z } from "zod";

import { siteConfig } from "@/config/site.config";
import { ValidationError } from "@/server/errors";
import { mapSettingsRowToSiteConfig } from "@/server/mappers/settings.mapper";
import { internalPathSchema } from "@/server/validation/url.validation";
import type { SiteConfig, SiteSettingsMutationInput } from "@/types";

import { getContentSource } from "./content-source";
import { executeRepository } from "./service-helpers";

const hexColorSchema = z.string().regex(/^#[0-9a-f]{6}$/i, "Màu phải ở định dạng #RRGGBB");
const themeSchema = z.object({ mode: z.enum(["light", "dark", "system"]), layout: z.enum(["creator", "minimal", "magazine"]), cardStyle: z.enum(["solid", "bordered", "glass", "minimal"]), buttonStyle: z.enum(["solid", "gradient", "outline", "pill"]), primaryColor: hexColorSchema, secondaryColor: hexColorSchema, accentColor: hexColorSchema, borderRadius: z.coerce.number().int().min(0).max(32) });
const sectionSchema = z.object({ hero: z.boolean(), socialLinks: z.boolean(), featuredContent: z.boolean(), latestPosts: z.boolean(), latestVideos: z.boolean(), gallery: z.boolean(), events: z.boolean(), campaign: z.boolean(), newsletter: z.boolean(), collaboration: z.boolean() });
const settingsMutationSchema = z.object({
  siteName: z.string().trim().min(2).max(100), siteDescription: z.string().trim().min(10).max(300), creatorName: z.string().trim().min(2).max(100), username: z.string().trim().min(1).max(100), contactEmail: z.email("Email không hợp lệ"),
  avatarMediaId: z.uuid().nullable().optional(), coverMediaId: z.uuid().nullable().optional(),
  defaultSeoTitle: z.string().trim().min(2).max(100).nullable().optional(), defaultSeoDescription: z.string().trim().min(10).max(300).nullable().optional(),
  theme: themeSchema, homepageSections: sectionSchema,
  navigation: z.array(z.object({ label: z.string().trim().min(1).max(80), href: internalPathSchema, description: z.string().trim().max(200).optional(), external: z.boolean().optional() })).max(30),
});

async function ensureImage(mediaId: string | null | undefined, field: "avatarMediaId" | "coverMediaId") {
  if (!mediaId) return null;
  const { findMediaAssetById } = await import("@/server/repositories/media.repository");
  const media = await executeRepository(() => findMediaAssetById(mediaId));
  if (!media || media.deletedAt || media.type !== "image" || media.status !== "ready" || media.visibility !== "public" || !media.publicUrl) throw new ValidationError("Ảnh cài đặt không hợp lệ", { [field]: ["Hãy chọn ảnh public đang sẵn sàng"] });
  return mediaId;
}

function fallbackSettings(): SiteSettingsMutationInput {
  return { siteName: siteConfig.siteName, siteDescription: siteConfig.siteDescription, creatorName: siteConfig.creatorName, username: siteConfig.username, contactEmail: siteConfig.contactEmail, avatarMediaId: null, coverMediaId: null, defaultSeoTitle: siteConfig.siteName, defaultSeoDescription: siteConfig.siteDescription, theme: siteConfig.theme, homepageSections: siteConfig.homepageSections, navigation: siteConfig.navigation };
}

export async function getSiteSettings(): Promise<SiteConfig> {
  if (getContentSource() === "mock") return { ...siteConfig };
  const { findSiteSettings } = await import("@/server/repositories/settings.repository");
  return executeRepository(async () => {
    const row = await findSiteSettings();
    return row ? mapSettingsRowToSiteConfig(row, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000") : { ...siteConfig };
  });
}

export async function getAdminSiteSettings(): Promise<SiteSettingsMutationInput> {
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission("settings:manage");
  const { findSiteSettings } = await import("@/server/repositories/settings.repository");
  return executeRepository(async () => {
    const row = await findSiteSettings();
    if (!row) return fallbackSettings();
    return { siteName: row.siteName, siteDescription: row.siteDescription, creatorName: row.creatorName, username: row.username, contactEmail: row.contactEmail, avatarMediaId: row.avatarMediaId, coverMediaId: row.coverMediaId, defaultSeoTitle: row.defaultSeoTitle, defaultSeoDescription: row.defaultSeoDescription, theme: row.theme, homepageSections: row.homepageSections, navigation: row.navigation };
  });
}

export async function updateSiteSettings(input: unknown) {
  const { requireServicePermission } = await import("./service-authorization");
  const currentUser = await requireServicePermission("settings:manage");
  const parsed = settingsMutationSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError("Cài đặt website chưa hợp lệ", parsed.error.flatten().fieldErrors);
  const avatarMediaId = await ensureImage(parsed.data.avatarMediaId, "avatarMediaId");
  const coverMediaId = await ensureImage(parsed.data.coverMediaId, "coverMediaId");
  const repository = await import("@/server/repositories/settings.repository");
  return executeRepository(() => repository.upsertSiteSettings({ settingsKey: "default", siteName: parsed.data.siteName, siteDescription: parsed.data.siteDescription, locale: siteConfig.locale, creatorName: parsed.data.creatorName, username: parsed.data.username, contactEmail: parsed.data.contactEmail, avatarMediaId, coverMediaId, defaultSeoTitle: parsed.data.defaultSeoTitle || null, defaultSeoDescription: parsed.data.defaultSeoDescription || null, theme: parsed.data.theme, homepageSections: parsed.data.homepageSections, navigation: parsed.data.navigation }, currentUser.id));
}
