import type { MetadataRoute } from "next";

import { getPublicCampaigns } from "@/services/campaign.service";
import { getEvents } from "@/services/event.service";
import { getPublishedPosts } from "@/services/post.service";
import { getSiteSettings } from "@/server/services/settings.service";

function absoluteUrl(pathname: string, siteUrl: string): string {
  return new URL(pathname, siteUrl).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  const url = (pathname: string) => absoluteUrl(pathname, settings.siteUrl);
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/blog"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/videos"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/gallery"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/events"), changeFrequency: "daily", priority: 0.8 },
    { url: url("/campaigns"), changeFrequency: "daily", priority: 0.8 },
    { url: url("/about"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/contact"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/privacy"), changeFrequency: "yearly", priority: 0.3 },
    { url: url("/terms"), changeFrequency: "yearly", priority: 0.3 },
  ];

  const postRoutes: MetadataRoute.Sitemap = (await getPublishedPosts()).map((post) => ({
    url: url(`/blog/${post.slug}`),
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
    images: [url(post.coverImage ?? post.thumbnail)],
  }));

  const eventRoutes: MetadataRoute.Sitemap = (await getEvents()).map((event) => ({
    url: url(`/events/${event.slug}`),
    changeFrequency: "weekly",
    priority: 0.6,
    images: [url(event.banner)],
  }));

  const campaignRoutes: MetadataRoute.Sitemap = (await getPublicCampaigns()).map(
    (campaign) => ({
      url: url(`/campaigns/${campaign.slug}`),
      changeFrequency: "weekly",
      priority: 0.6,
      images: [url(campaign.banner)],
    }),
  );

  return [...staticRoutes, ...postRoutes, ...eventRoutes, ...campaignRoutes];
}
