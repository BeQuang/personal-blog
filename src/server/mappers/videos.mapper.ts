import type { VideoItem } from "@/types";

import { ValidationError } from "@/server/errors";
import type { findPublishedVideos } from "@/server/repositories/videos.repository";

import { requirePublicMediaUrl } from "./mapper-helpers";

type VideoWithRelations = Awaited<ReturnType<typeof findPublishedVideos>>[number];

function formatDuration(value: string | null) {
  if (value === null) return undefined;

  const seconds = Math.max(0, Math.round(Number(value)));
  if (!Number.isFinite(seconds)) return undefined;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function mapVideoRowToVideoItem(row: VideoWithRelations): VideoItem {
  const videoUrl = row.platform === "internal" ? row.videoMedia?.publicUrl : row.externalUrl;
  if (!videoUrl || !row.publishedAt) {
    throw new ValidationError(`Published video '${row.id}' is missing its URL or published date`);
  }

  return {
    id: row.id,
    title: row.title,
    ...(row.description ? { description: row.description } : {}),
    platform: row.platform,
    orientation: row.orientation,
    thumbnail: requirePublicMediaUrl(row.thumbnailMedia, `Video '${row.id}' thumbnail`),
    videoUrl,
    ...(formatDuration(row.durationSeconds)
      ? { duration: formatDuration(row.durationSeconds) }
      : {}),
    viewCount: row.viewCount,
    topic: row.topic,
    featured: row.featured,
    publishedAt: row.publishedAt.toISOString(),
  };
}
