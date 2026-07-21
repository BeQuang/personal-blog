import "server-only";

import Mux from "@mux/mux-node";
import { z } from "zod";

import { ValidationError } from "@/server/errors";

import type { VideoProvider } from "./video-provider";
import type {
  CreateVideoProviderUploadInput,
  VerifiedVideoEvent,
  VideoAssetInfo,
} from "./video.types";

const muxConfigSchema = z.object({
  tokenId: z.string().trim().min(1, "MUX_TOKEN_ID is required"),
  tokenSecret: z.string().trim().min(1, "MUX_TOKEN_SECRET is required"),
  webhookSecret: z.string().trim().min(1, "MUX_WEBHOOK_SECRET is required"),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringValue(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function numberValue(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function playbackIdFromData(data: Record<string, unknown>) {
  const playbackIds = data.playback_ids;
  if (!Array.isArray(playbackIds)) return null;

  for (const item of playbackIds) {
    if (!isRecord(item)) continue;
    const id = stringValue(item, "id");
    const policy = stringValue(item, "policy");
    if (id && (policy === "public" || policy === null)) return id;
  }
  return null;
}

function errorFromData(data: Record<string, unknown>) {
  const error = data.errors ?? data.error;
  if (!isRecord(error)) return null;
  const messages = error.messages;
  if (Array.isArray(messages)) {
    const message = messages.find((item): item is string => typeof item === "string");
    if (message) return message.slice(0, 1000);
  }
  return stringValue(error, "message")?.slice(0, 1000) ??
    stringValue(error, "type")?.slice(0, 1000) ?? null;
}

function passthroughFromData(data: Record<string, unknown>) {
  const direct = stringValue(data, "passthrough");
  if (direct) return direct;
  const settings = data.new_asset_settings;
  return isRecord(settings) ? stringValue(settings, "passthrough") : null;
}

function statusForEvent(type: string) {
  if (type === "video.upload.created") return "uploading" as const;
  if (type === "video.upload.asset_created" || type === "video.asset.created") {
    return "processing" as const;
  }
  if (type === "video.asset.ready") return "ready" as const;
  if (type === "video.asset.deleted") return "deleted" as const;
  if (
    type === "video.upload.errored" ||
    type === "video.asset.errored" ||
    type === "video.upload.cancelled" ||
    type === "video.upload.timed_out"
  ) {
    return "failed" as const;
  }
  return "ignored" as const;
}

export class MuxVideoProvider implements VideoProvider {
  private readonly client: Mux;
  private readonly webhookSecret: string;

  constructor() {
    const config = muxConfigSchema.parse({
      tokenId: process.env.MUX_TOKEN_ID,
      tokenSecret: process.env.MUX_TOKEN_SECRET,
      webhookSecret: process.env.MUX_WEBHOOK_SECRET,
    });
    this.client = new Mux({ tokenId: config.tokenId, tokenSecret: config.tokenSecret });
    this.webhookSecret = config.webhookSecret;
  }

  async createDirectUpload(input: CreateVideoProviderUploadInput) {
    const upload = await this.client.video.uploads.create({
      cors_origin: input.corsOrigin,
      timeout: 3600,
      new_asset_settings: {
        passthrough: input.videoId,
        playback_policies: ["public"],
        video_quality: "basic",
      },
    });
    if (!upload.url) throw new Error("Mux did not return a direct upload URL");
    return { id: upload.id, url: upload.url, status: upload.status };
  }

  async getAsset(assetId: string): Promise<VideoAssetInfo> {
    const asset = await this.client.video.assets.retrieve(assetId);
    return {
      id: asset.id,
      status: asset.status,
      passthrough: asset.passthrough ?? null,
      playbackId: asset.playback_ids?.find((item) => item.policy === "public")?.id ?? null,
      duration: asset.duration ?? null,
      aspectRatio: asset.aspect_ratio ?? null,
      error: asset.errors?.messages?.[0] ?? asset.errors?.type ?? null,
    };
  }

  async deleteAsset(assetId: string) {
    await this.client.video.assets.delete(assetId);
  }

  async verifyWebhook(rawBody: string, signature: string): Promise<VerifiedVideoEvent> {
    const event = await this.client.webhooks.unwrap(
      rawBody,
      { "mux-signature": signature },
      this.webhookSecret,
    );
    const data = isRecord(event.data) ? event.data : {};
    const objectId = stringValue(data, "id") ?? event.object?.id ?? null;
    const type = event.type;
    const isUpload = type.startsWith("video.upload.");
    const isAsset = type.startsWith("video.asset.");

    return {
      id: event.id,
      type,
      objectId,
      videoId: passthroughFromData(data),
      uploadId: isUpload ? objectId : null,
      assetId: isAsset ? objectId : stringValue(data, "asset_id"),
      playbackId: playbackIdFromData(data),
      duration: numberValue(data, "duration"),
      aspectRatio: stringValue(data, "aspect_ratio"),
      status: statusForEvent(type),
      error: errorFromData(data),
    };
  }

  createPlaybackData(asset: VideoAssetInfo) {
    if (asset.status !== "ready" || !asset.playbackId) {
      throw new ValidationError("Mux asset is not ready for playback");
    }
    return {
      playbackId: asset.playbackId,
      posterUrl: `https://image.mux.com/${asset.playbackId}/thumbnail.webp`,
      streamUrl: `https://stream.mux.com/${asset.playbackId}.m3u8`,
    };
  }
}
