import "server-only";

import { z } from "zod";

import { galleryItems as mockGalleryItems } from "@/data/gallery";
import { ValidationError } from "@/server/errors";
import { mapGalleryRowToGalleryItem } from "@/server/mappers/gallery.mapper";

import { getContentSource } from "./content-source";
import { executeRepository } from "./service-helpers";

const galleryMutationSchema = z.object({
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(500).optional(),
  category: z.string().trim().min(1).max(100),
  alt: z.string().trim().min(3).max(300),
  status: z.enum(["draft", "scheduled", "published", "archived"]),
  publishedAt: z.coerce.date().nullable().optional(),
});

export async function getGalleryItems() {
  if (getContentSource() === "mock") {
    return mockGalleryItems
      .map((item) => ({ ...item }))
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );
  }

  const { findPublishedGalleryItems } = await import("@/server/repositories/gallery.repository");
  return executeRepository(async () => (await findPublishedGalleryItems()).map(mapGalleryRowToGalleryItem));
}

export async function getGalleryItemsByCategory(category: string) {
  const normalizedCategory = category.trim().toLocaleLowerCase("vi-VN");
  return (await getGalleryItems()).filter(
    (item) => item.category.toLocaleLowerCase("vi-VN") === normalizedCategory,
  );
}

export async function getGalleryPreview(limit = 8) {
  return (await getGalleryItems()).slice(0, Math.max(0, limit));
}

export async function prepareGalleryMutation(input: unknown) {
  const parsed = galleryMutationSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Gallery validation failed", parsed.error.flatten().fieldErrors);
  }
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission(
    parsed.data.status === "published" ? "content:publish" : "media:manage",
  );
  const now = new Date();
  if (parsed.data.status === "published" && !parsed.data.publishedAt) {
    throw new ValidationError("Published gallery items require a published time", {
      publishedAt: ["Published time is required"],
    });
  }
  if (parsed.data.status === "published" && parsed.data.publishedAt && parsed.data.publishedAt > now) {
    throw new ValidationError("Published gallery items cannot have a future published time");
  }
  if (parsed.data.status === "scheduled" && (!parsed.data.publishedAt || parsed.data.publishedAt <= now)) {
    throw new ValidationError("Scheduled gallery items require a future published time", {
      publishedAt: ["Published time must be in the future"],
    });
  }
  return parsed.data;
}
