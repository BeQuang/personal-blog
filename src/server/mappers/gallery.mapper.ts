import type { GalleryItem } from "@/types";

import type { findPublishedGalleryItems } from "@/server/repositories/gallery.repository";

import { requirePublicMediaUrl } from "./mapper-helpers";

type GalleryWithMedia = Awaited<ReturnType<typeof findPublishedGalleryItems>>[number];

export function mapGalleryRowToGalleryItem(row: GalleryWithMedia): GalleryItem {
  return {
    id: row.id,
    title: row.title,
    ...(row.description ? { description: row.description } : {}),
    imageUrl: requirePublicMediaUrl(row.mediaAsset, `Gallery item '${row.id}'`),
    category: row.category,
    alt: row.alt,
    ...(row.mediaAsset.width ? { width: row.mediaAsset.width } : {}),
    ...(row.mediaAsset.height ? { height: row.mediaAsset.height } : {}),
    createdAt: row.createdAt.toISOString(),
  };
}
