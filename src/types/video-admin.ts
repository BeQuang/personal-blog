import type { AdminPostStatus, MediaOption } from "./content-admin";
import type { VideoOrientation, VideoPlatform } from "./video";

export type VideoProcessingStatus =
  | "pending"
  | "uploading"
  | "processing"
  | "ready"
  | "failed"
  | "deleted";

export interface AdminVideo {
  id: string;
  title: string;
  description: string | null;
  platform: VideoPlatform;
  orientation: VideoOrientation;
  topic: string;
  externalUrl: string | null;
  thumbnailMediaId: string | null;
  thumbnailUrl: string | null;
  muxUploadId: string | null;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  durationSeconds: number | null;
  aspectRatio: string | null;
  processingStatus: VideoProcessingStatus;
  processingError: string | null;
  contentStatus: AdminPostStatus;
  featured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VideoMutationInput {
  title: string;
  description?: string | null;
  platform: Exclude<VideoPlatform, "internal"> | "internal";
  orientation: VideoOrientation;
  topic: string;
  externalUrl?: string | null;
  thumbnailMediaId?: string | null;
  featured: boolean;
}

export interface CreateVideoUploadInput {
  title: string;
  description?: string | null;
  orientation: VideoOrientation;
  topic: string;
  thumbnailMediaId?: string | null;
  featured: boolean;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  retryVideoId?: string;
}

export interface CreateVideoUploadData {
  videoId: string;
  uploadId: string;
  uploadUrl: string;
}

export interface VideoActionResult<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  fieldErrors?: Readonly<Record<string, readonly string[]>>;
}

export interface AdminVideosPageData {
  videos: readonly AdminVideo[];
  mediaOptions: readonly MediaOption[];
}
