import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site.config";
import { getPublicCampaigns } from "@/services/campaign.service";
import { getEvents } from "@/services/event.service";
import { getPublishedPosts } from "@/services/post.service";

function absoluteUrl(pathname: string): string {
  return new URL(pathname, siteConfig.siteUrl).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/videos"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/gallery"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/events"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/campaigns"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.3 },
  ];

  const postRoutes: MetadataRoute.Sitemap = getPublishedPosts().map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
    images: [absoluteUrl(post.coverImage ?? post.thumbnail)],
  }));

  const eventRoutes: MetadataRoute.Sitemap = getEvents().map((event) => ({
    url: absoluteUrl(`/events/${event.slug}`),
    changeFrequency: "weekly",
    priority: 0.6,
    images: [absoluteUrl(event.banner)],
  }));

  const campaignRoutes: MetadataRoute.Sitemap = getPublicCampaigns().map(
    (campaign) => ({
      url: absoluteUrl(`/campaigns/${campaign.slug}`),
      changeFrequency: "weekly",
      priority: 0.6,
      images: [absoluteUrl(campaign.banner)],
    }),
  );

  return [...staticRoutes, ...postRoutes, ...eventRoutes, ...campaignRoutes];
}
