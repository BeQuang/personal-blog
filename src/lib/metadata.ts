import type { Metadata } from "next";

import { siteConfig } from "@/config/site.config";
import type { SiteConfig } from "@/types";

export function withSocialMetadata(metadata: Metadata, settings: SiteConfig = siteConfig): Metadata {
  const openGraph = metadata.openGraph;

  if (!openGraph) {
    return metadata;
  }

  return {
    ...metadata,
    openGraph: {
      siteName: settings.siteName,
      locale: settings.locale.replace("-", "_"),
      ...openGraph,
    },
    twitter: {
      card: "summary_large_image",
      creator: settings.username,
      ...(openGraph.title ? { title: openGraph.title } : {}),
      ...(openGraph.description ? { description: openGraph.description } : {}),
      ...(openGraph.images ? { images: openGraph.images } : {}),
      ...(metadata.twitter ?? {}),
    },
  };
}
