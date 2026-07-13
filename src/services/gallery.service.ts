import { galleryItems } from "@/data/gallery";
import type { GalleryItem } from "@/types";
import { sortByDateDescending } from "@/utils/data";

export function getGalleryItems(): GalleryItem[] {
  return sortByDateDescending(galleryItems, (item) => item.createdAt);
}

export function getGalleryItemsByCategory(category: string): GalleryItem[] {
  const normalizedCategory = category.trim().toLocaleLowerCase("vi-VN");
  return getGalleryItems().filter(
    (item) => item.category.toLocaleLowerCase("vi-VN") === normalizedCategory,
  );
}

export function getGalleryPreview(limit = 8): GalleryItem[] {
  return getGalleryItems().slice(0, Math.max(0, limit));
}
