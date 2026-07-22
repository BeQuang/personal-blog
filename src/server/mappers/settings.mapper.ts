import type { SiteConfig } from "@/types";

import type { findSiteSettings } from "@/server/repositories/settings.repository";

type SettingsWithMedia = NonNullable<Awaited<ReturnType<typeof findSiteSettings>>>;

export function mapSettingsRowToSiteConfig(row: SettingsWithMedia, siteUrl: string): SiteConfig {
  return {
    siteName: row.siteName,
    siteDescription: row.siteDescription,
    siteUrl,
    locale: row.locale,
    ...(row.avatarMedia?.publicUrl ? { avatar: row.avatarMedia.publicUrl } : {}),
    ...(row.coverMedia?.publicUrl ? { coverImage: row.coverMedia.publicUrl } : {}),
    creatorName: row.creatorName,
    username: row.username,
    contactEmail: row.contactEmail,
    ...(row.defaultSeoTitle ? { defaultSeoTitle: row.defaultSeoTitle } : {}),
    ...(row.defaultSeoDescription ? { defaultSeoDescription: row.defaultSeoDescription } : {}),
    theme: row.theme,
    navigation: row.navigation,
    homepageSections: row.homepageSections,
  };
}
