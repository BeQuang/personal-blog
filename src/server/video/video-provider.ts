import "server-only";

import type {
  CreateVideoProviderUploadInput,
  DirectVideoUploadResult,
  VerifiedVideoEvent,
  VideoAssetInfo,
  VideoPlaybackData,
} from "./video.types";

export interface VideoProvider {
  createDirectUpload(
    input: CreateVideoProviderUploadInput,
  ): Promise<DirectVideoUploadResult>;
  getAsset(assetId: string): Promise<VideoAssetInfo>;
  deleteAsset(assetId: string): Promise<void>;
  verifyWebhook(rawBody: string, signature: string): Promise<VerifiedVideoEvent>;
  createPlaybackData(asset: VideoAssetInfo): VideoPlaybackData;
}
