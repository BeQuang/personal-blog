export type VideoProviderProcessingStatus =
  | "uploading"
  | "processing"
  | "ready"
  | "failed"
  | "deleted"
  | "ignored";

export interface CreateVideoProviderUploadInput {
  videoId: string;
  corsOrigin: string;
}

export interface DirectVideoUploadResult {
  id: string;
  url: string;
  status: "waiting" | "asset_created" | "errored" | "cancelled" | "timed_out";
}

export interface VideoAssetInfo {
  id: string;
  status: "preparing" | "ready" | "errored";
  passthrough: string | null;
  playbackId: string | null;
  duration: number | null;
  aspectRatio: string | null;
  error: string | null;
}

export interface VideoPlaybackData {
  playbackId: string;
  posterUrl: string;
  streamUrl: string;
}

export interface VerifiedVideoEvent {
  id: string;
  type: string;
  objectId: string | null;
  videoId: string | null;
  uploadId: string | null;
  assetId: string | null;
  playbackId: string | null;
  duration: number | null;
  aspectRatio: string | null;
  status: VideoProviderProcessingStatus;
  error: string | null;
}
