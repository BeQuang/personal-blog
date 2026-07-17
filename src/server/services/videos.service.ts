import "server-only";

import { z } from "zod";

import { videos as mockVideos } from "@/data/videos";
import { ValidationError } from "@/server/errors";
import { mapVideoRowToVideoItem } from "@/server/mappers/videos.mapper";

import { getContentSource } from "./content-source";
import { executeRepository } from "./service-helpers";

const videoMutationSchema = z
  .object({
    title: z.string().trim().min(3).max(180),
    platform: z.enum(["youtube", "tiktok", "instagram", "facebook", "internal"]),
    orientation: z.enum(["landscape", "portrait"]),
    topic: z.string().trim().min(1).max(100),
    externalUrl: z.url().nullable().optional(),
    contentStatus: z.enum(["draft", "scheduled", "published", "archived"]),
    publishedAt: z.coerce.date().nullable().optional(),
  })
  .superRefine((value, context) => {
    if (value.platform !== "internal" && !value.externalUrl) {
      context.addIssue({ code: "custom", path: ["externalUrl"], message: "External videos require a URL" });
    }
    if (value.contentStatus === "published" && !value.publishedAt) {
      context.addIssue({ code: "custom", path: ["publishedAt"], message: "Published videos require a published time" });
    }
  });

export async function getVideos() {
  if (getContentSource() === "mock") {
    return mockVideos
      .map((video) => ({ ...video }))
      .sort(
        (left, right) =>
          new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
      );
  }

  const { findPublishedVideos } = await import("@/server/repositories/videos.repository");
  return executeRepository(async () => (await findPublishedVideos()).map(mapVideoRowToVideoItem));
}

export async function getFeaturedVideos(limit?: number) {
  const featuredVideos = (await getVideos()).filter((video) => video.featured);
  return limit === undefined ? featuredVideos : featuredVideos.slice(0, Math.max(0, limit));
}

export async function getVideosByPlatform(platform: (typeof mockVideos)[number]["platform"]) {
  return (await getVideos()).filter((video) => video.platform === platform);
}

export async function getVideosByTopic(topic: string) {
  const normalizedTopic = topic.trim().toLocaleLowerCase("vi-VN");
  return (await getVideos()).filter(
    (video) => video.topic.toLocaleLowerCase("vi-VN") === normalizedTopic,
  );
}

export async function prepareVideoMutation(input: unknown) {
  const parsed = videoMutationSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Video validation failed", parsed.error.flatten().fieldErrors);
  }
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission(
    parsed.data.contentStatus === "published" ? "content:publish" : "media:manage",
  );
  const now = new Date();
  if (parsed.data.contentStatus === "published" && parsed.data.publishedAt && parsed.data.publishedAt > now) {
    throw new ValidationError("Published videos cannot have a future published time");
  }
  if (parsed.data.contentStatus === "scheduled" && (!parsed.data.publishedAt || parsed.data.publishedAt <= now)) {
    throw new ValidationError("Scheduled videos require a future published time", {
      publishedAt: ["Published time must be in the future"],
    });
  }
  return parsed.data;
}
