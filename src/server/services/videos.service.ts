import "server-only";

import { randomUUID } from "node:crypto";
import { z } from "zod";

import { videos as mockVideos } from "@/data/videos";
import { NotFoundError, ValidationError } from "@/server/errors";
import { mapVideoRowToVideoItem } from "@/server/mappers/videos.mapper";
import { getVideoProvider, type VerifiedVideoEvent } from "@/server/video";
import {
  parseCreateVideoUpload,
  parseVideoMutation,
} from "@/server/validation/videos.validation";
import type { AdminVideo, MediaOption, VideoMutationInput } from "@/types";

import { getContentSource } from "./content-source";
import { executeRepository } from "./service-helpers";

const idSchema = z.uuid("ID video không hợp lệ");

async function requirePermission(permission: "content:write" | "content:publish" | "media:manage") {
  const { requireServicePermission } = await import("./service-authorization");
  return requireServicePermission(permission);
}

function muxThumbnail(playbackId: string | null) {
  return playbackId
    ? `https://image.mux.com/${playbackId}/thumbnail.webp?width=640&fit_mode=preserve`
    : null;
}

function mapAdminVideo(row: Awaited<ReturnType<typeof import("@/server/repositories/videos.repository").findVideos>>[number]): AdminVideo {
  const duration = row.durationSeconds === null ? null : Number(row.durationSeconds);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    platform: row.platform,
    orientation: row.orientation,
    topic: row.topic,
    externalUrl: row.externalUrl,
    thumbnailMediaId: row.thumbnailMediaId,
    thumbnailUrl: row.thumbnailMedia?.publicUrl ?? muxThumbnail(row.muxPlaybackId),
    muxUploadId: row.muxUploadId,
    muxAssetId: row.muxAssetId,
    muxPlaybackId: row.muxPlaybackId,
    durationSeconds: duration !== null && Number.isFinite(duration) ? duration : null,
    aspectRatio: row.aspectRatio,
    processingStatus: row.processingStatus,
    processingError: row.processingError,
    contentStatus: row.contentStatus,
    featured: row.featured,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function ensureThumbnailAvailable(mediaId: string | null | undefined) {
  if (!mediaId) return null;
  const { findMediaAssetById } = await import("@/server/repositories/media.repository");
  const media = await executeRepository(() => findMediaAssetById(mediaId));
  if (
    !media ||
    media.deletedAt ||
    media.type !== "image" ||
    media.status !== "ready" ||
    media.visibility !== "public" ||
    !media.publicUrl
  ) {
    throw new ValidationError("Thumbnail đã chọn không thể sử dụng", {
      thumbnailMediaId: ["Hãy chọn ảnh đang ở trạng thái sẵn sàng trong Media Library"],
    });
  }
  return media.id;
}

export async function getVideos() {
  if (getContentSource() === "mock") {
    return mockVideos
      .filter((video) => video.platform !== "internal")
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

export async function getAdminVideos() {
  await requirePermission("media:manage");
  const repository = await import("@/server/repositories/videos.repository");
  return executeRepository(async () => (await repository.findVideos()).map(mapAdminVideo));
}

export async function getVideoMediaOptions(): Promise<MediaOption[]> {
  await requirePermission("media:manage");
  const { findAvailablePostMedia } = await import("@/server/repositories/media.repository");
  const rows = await executeRepository(() => findAvailablePostMedia());
  return rows.flatMap((row) => row.publicUrl ? [{
    id: row.id,
    label: row.alt || row.originalFilename || "Ảnh media",
    publicUrl: row.publicUrl,
  }] : []);
}

export async function createVideoDirectUpload(
  input: unknown,
  corsOrigin: string,
) {
  const currentUser = await requirePermission("media:manage");
  const parsed = parseCreateVideoUpload(input);
  const thumbnailMediaId = await ensureThumbnailAvailable(parsed.thumbnailMediaId);
  const repository = await import("@/server/repositories/videos.repository");
  const provider = getVideoProvider();

  if (parsed.retryVideoId) {
    const id = idSchema.parse(parsed.retryVideoId);
    const existing = await executeRepository(() => repository.findVideoById(id));
    if (!existing) throw new NotFoundError("Video", id);
    if (
      existing.platform !== "internal" ||
      existing.processingStatus !== "failed" ||
      existing.contentStatus !== "draft"
    ) {
      throw new ValidationError("Chỉ có thể upload lại video Mux bị lỗi đang ở bản nháp");
    }
    const upload = await provider.createDirectUpload({ videoId: id, corsOrigin });
    const updated = await executeRepository(() => repository.updateVideo(id, {
      title: parsed.title,
      description: parsed.description,
      orientation: parsed.orientation,
      topic: parsed.topic,
      thumbnailMediaId,
      featured: parsed.featured,
      muxUploadId: upload.id,
      muxAssetId: null,
      muxPlaybackId: null,
      durationSeconds: null,
      aspectRatio: null,
      processingStatus: "uploading",
      processingError: null,
    }, currentUser.id, "video.retry"));
    if (!updated) throw new NotFoundError("Video", id);
    return { videoId: id, uploadId: upload.id, uploadUrl: upload.url };
  }

  const videoId = randomUUID();
  const upload = await provider.createDirectUpload({ videoId, corsOrigin });
  await executeRepository(() => repository.createVideo({
    id: videoId,
    title: parsed.title,
    description: parsed.description,
    platform: "internal",
    orientation: parsed.orientation,
    topic: parsed.topic,
    thumbnailMediaId,
    muxUploadId: upload.id,
    processingStatus: "uploading",
    processingError: null,
    contentStatus: "draft",
    featured: parsed.featured,
  }, currentUser.id));
  return { videoId, uploadId: upload.id, uploadUrl: upload.url };
}

export async function createExternalVideo(input: VideoMutationInput) {
  const currentUser = await requirePermission("content:write");
  const parsed = parseVideoMutation(input);
  if (parsed.platform === "internal") {
    throw new ValidationError("Video Mux phải được tạo bằng luồng direct upload");
  }
  const thumbnailMediaId = await ensureThumbnailAvailable(parsed.thumbnailMediaId);
  const repository = await import("@/server/repositories/videos.repository");
  return executeRepository(() => repository.createVideo({
    title: parsed.title,
    description: parsed.description,
    platform: parsed.platform,
    orientation: parsed.orientation,
    topic: parsed.topic,
    externalUrl: parsed.externalUrl,
    thumbnailMediaId,
    processingStatus: "ready",
    contentStatus: "draft",
    featured: parsed.featured,
  }, currentUser.id));
}

export async function updateVideo(idValue: string, input: VideoMutationInput) {
  const id = idSchema.parse(idValue);
  const parsed = parseVideoMutation(input);
  const repository = await import("@/server/repositories/videos.repository");
  const existing = await executeRepository(() => repository.findVideoById(id));
  if (!existing) throw new NotFoundError("Video", id);
  const currentUser = await requirePermission(
    existing.contentStatus === "published" ? "content:publish" : "content:write",
  );
  if (existing.platform === "internal" && parsed.platform !== "internal") {
    throw new ValidationError("Không thể đổi video Mux thành video nền tảng ngoài");
  }
  if (existing.platform !== "internal" && parsed.platform === "internal") {
    throw new ValidationError("Hãy dùng direct upload để tạo video Mux");
  }
  const thumbnailMediaId = await ensureThumbnailAvailable(parsed.thumbnailMediaId);
  if (
    existing.contentStatus === "published" &&
    parsed.platform !== "internal" &&
    !thumbnailMediaId
  ) {
    throw new ValidationError("Video nền tảng ngoài đã xuất bản phải có thumbnail");
  }
  const row = await executeRepository(() => repository.updateVideo(id, {
    title: parsed.title,
    description: parsed.description,
    platform: parsed.platform,
    orientation: parsed.orientation,
    topic: parsed.topic,
    externalUrl: parsed.platform === "internal" ? null : parsed.externalUrl,
    thumbnailMediaId,
    featured: parsed.featured,
  }, currentUser.id));
  if (!row) throw new NotFoundError("Video", id);
  return row;
}

export async function setVideoPublished(idValue: string, published: boolean) {
  const id = idSchema.parse(idValue);
  const currentUser = await requirePermission("content:publish");
  const repository = await import("@/server/repositories/videos.repository");
  const existing = await executeRepository(() => repository.findVideoById(id));
  if (!existing) throw new NotFoundError("Video", id);
  if (
    published && existing.platform === "internal" &&
    (existing.processingStatus !== "ready" || !existing.muxPlaybackId)
  ) {
    throw new ValidationError("Video Mux chỉ có thể xuất bản sau khi xử lý hoàn tất");
  }
  if (published && existing.platform !== "internal" && !existing.externalUrl) {
    throw new ValidationError("Video nền tảng ngoài đang thiếu URL");
  }
  if (published && existing.platform !== "internal" && !existing.thumbnailMedia?.publicUrl) {
    throw new ValidationError("Video nền tảng ngoài cần thumbnail trước khi xuất bản");
  }
  const row = await executeRepository(() => repository.updateVideo(id, {
    contentStatus: published ? "published" : "draft",
    publishedAt: published ? existing.publishedAt ?? new Date() : null,
  }, currentUser.id, published ? "video.publish" : "video.unpublish"));
  if (!row) throw new NotFoundError("Video", id);
  return row;
}

export async function setVideoFeatured(idValue: string, featured: boolean) {
  const id = idSchema.parse(idValue);
  const repository = await import("@/server/repositories/videos.repository");
  const existing = await executeRepository(() => repository.findVideoById(id));
  if (!existing) throw new NotFoundError("Video", id);
  const currentUser = await requirePermission(
    existing.contentStatus === "published" ? "content:publish" : "content:write",
  );
  const row = await executeRepository(() => repository.updateVideo(
    id,
    { featured },
    currentUser.id,
    "video.featured",
  ));
  if (!row) throw new NotFoundError("Video", id);
  return row;
}

export async function deleteVideo(idValue: string, confirmProviderDelete: boolean) {
  const id = idSchema.parse(idValue);
  const repository = await import("@/server/repositories/videos.repository");
  const existing = await executeRepository(() => repository.findVideoById(id));
  if (!existing) throw new NotFoundError("Video", id);
  const currentUser = await requirePermission(
    existing.contentStatus === "published" ? "content:publish" : "media:manage",
  );
  if (existing.muxAssetId && !confirmProviderDelete) {
    throw new ValidationError("Cần xác nhận trước khi xóa Mux asset đang được video tham chiếu");
  }

  const deleted = await executeRepository(() => repository.softDeleteVideo(id, currentUser.id));
  if (!deleted) throw new NotFoundError("Video", id);
  if (existing.muxAssetId) {
    try {
      await getVideoProvider().deleteAsset(existing.muxAssetId);
    } catch (error) {
      await executeRepository(() => repository.restoreVideoAfterProviderFailure(
        id,
        deleted.before.contentStatus,
        currentUser.id,
      ));
      throw error;
    }
  }
  return deleted.row;
}

export function verifyVideoWebhook(rawBody: string, signature: string) {
  return getVideoProvider().verifyWebhook(rawBody, signature);
}

export async function processVerifiedVideoEvent(event: VerifiedVideoEvent) {
  if (event.status === "ignored") return { outcome: "ignored" as const, event };
  const repository = await import("@/server/repositories/videos.repository");
  const result = await executeRepository(() => repository.applyVideoWebhook(event));
  return { ...result, event };
}
