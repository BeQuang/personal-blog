import type { Metadata } from "next";

import { siteConfig } from "@/config/site.config";

export function withSocialMetadata(metadata: Metadata): Metadata {
  const openGraph = metadata.openGraph;

  if (!openGraph) {
    return metadata;
  }

  return {
    ...metadata,
    openGraph: {
      siteName: siteConfig.siteName,
      locale: siteConfig.locale.replace("-", "_"),
      ...openGraph,
    },
    twitter: {
      card: "summary_large_image",
      creator: siteConfig.username,
      ...(openGraph.title ? { title: openGraph.title } : {}),
      ...(openGraph.description ? { description: openGraph.description } : {}),
      ...(openGraph.images ? { images: openGraph.images } : {}),
      ...(metadata.twitter ?? {}),
    },
  };
}
