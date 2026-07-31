import "server-only";

import { z } from "zod";

import { ConflictError, NotFoundError, ValidationError } from "@/server/errors";
import { createImageObjectKey, imageMimeExtensions } from "@/server/storage/object-key";
import { getMediaStorage } from "@/server/storage/media-storage";
import { createUploadTicket, verifyUploadTicket } from "@/server/storage/upload-ticket";
import {
  hasExpectedImageSignature,
  mediaMimeTypes,
  mediaPurposes,
  parseConfirmUpload,
  parseUploadRequest,
} from "@/server/validation/media.validation";
import {
  adminListPageSchema,
  parseAdminListQuery,
} from "@/server/validation/admin-list.validation";
import type {
  ConfirmMediaUploadInput,
  CreateMediaUploadInput,
  MediaAssetItem,
  MediaLibraryQuery,
  MediaMimeType,
  MediaPurpose,
} from "@/types";

import { executeRepository } from "./service-helpers";

const idSchema = z.uuid("ID media không hợp lệ");
const listQuerySchema = adminListPageSchema.extend({
  sortBy: z.enum(["createdAt", "originalFilename", "sizeBytes"]).default("createdAt"),
  query: z.string().trim().max(100).optional(),
  mimeType: z.union([z.enum(mediaMimeTypes), z.literal("all")]).default("all"),
  purpose: z.union([z.enum(mediaPurposes), z.literal("all")]).default("all"),
});

const uploadUrlLifetimeMs = 5 * 60 * 1000;

function getPurpose(value: Record<string, unknown>): MediaPurpose {
  return mediaPurposes.includes(value.purpose as MediaPurpose)
    ? value.purpose as MediaPurpose
    : "gallery";
}

function mapMediaAsset(row: {
  id: string;
  originalFilename: string | null;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  metadata: Record<string, unknown>;
  publicUrl: string | null;
  createdAt: Date;
}): MediaAssetItem {
  return {
    id: row.id,
    originalFilename: row.originalFilename ?? "image",
    mimeType: row.mimeType as MediaMimeType,
    extension: row.extension,
    sizeBytes: row.sizeBytes,
    width: row.width,
    height: row.height,
    alt: row.alt,
    purpose: getPurpose(row.metadata),
    publicUrl: row.publicUrl ?? "",
    createdAt: row.createdAt.toISOString(),
  };
}

async function requireMediaPermission() {
  const { requireServicePermission } = await import("./service-authorization");
  return requireServicePermission("media:manage");
}

export async function getMediaLibrary(input: unknown = {}) {
  await requireMediaPermission();
  const parsed = parseAdminListQuery(
    listQuerySchema,
    input,
    "Bộ lọc Media Library chưa hợp lệ",
  ) as Required<MediaLibraryQuery>;
  const repository = await import("@/server/repositories/media.repository");
  const result = await executeRepository(() => repository.findMediaLibrary(parsed));
  return {
    items: result.items.map(mapMediaAsset),
    page: parsed.page,
    pageSize: parsed.pageSize,
    total: result.total,
    sortBy: parsed.sortBy,
    sortOrder: parsed.sortOrder,
  };
}

export async function getMediaPickerItems() {
  await requireMediaPermission();
  const repository = await import("@/server/repositories/media.repository");
  return executeRepository(async () => (await repository.findMediaPickerItems()).map(mapMediaAsset));
}

export async function createMediaUpload(input: CreateMediaUploadInput) {
  const currentUser = await requireMediaPermission();
  const parsed = parseUploadRequest(input);
  const objectKey = createImageObjectKey(parsed.mimeType);
  const expiresAt = Date.now() + uploadUrlLifetimeMs;
  const storage = getMediaStorage();
  const uploadUrl = await storage.createUploadUrl({
    objectKey,
    contentType: parsed.mimeType,
    expiresInSeconds: Math.floor(uploadUrlLifetimeMs / 1000),
  });
  const uploadTicket = createUploadTicket({
    expiresAt,
    mimeType: parsed.mimeType,
    objectKey,
    originalFilename: parsed.originalFilename,
    purpose: parsed.purpose,
    sizeBytes: parsed.sizeBytes,
    uploadedBy: currentUser.id,
  });

  return {
    uploadUrl,
    uploadTicket,
    expiresAt: new Date(expiresAt).toISOString(),
    headers: { "Content-Type": parsed.mimeType },
  };
}

export async function confirmMediaUpload(input: ConfirmMediaUploadInput) {
  const currentUser = await requireMediaPermission();
  const parsed = parseConfirmUpload(input);
  const ticket = verifyUploadTicket(parsed.uploadTicket);
  if (ticket.uploadedBy !== currentUser.id) {
    throw new ValidationError("Upload ticket không thuộc về tài khoản hiện tại");
  }

  const repository = await import("@/server/repositories/media.repository");
  const existing = await executeRepository(() => repository.findMediaAssetByObjectKey(ticket.objectKey));
  if (existing) {
    if (existing.deletedAt || existing.status !== "ready" || !existing.publicUrl) {
      throw new ConflictError("Media upload này không còn ở trạng thái có thể sử dụng");
    }
    return mapMediaAsset(existing);
  }

  const storage = getMediaStorage();
  const metadata = await storage.getObjectMetadata(ticket.objectKey);
  if (!metadata) throw new ValidationError("Không tìm thấy object sau khi upload");
  if (metadata.contentLength !== ticket.sizeBytes || metadata.contentType !== ticket.mimeType) {
    await storage.deleteObject(ticket.objectKey);
    throw new ValidationError("Object upload không khớp kích thước hoặc MIME type đã khai báo");
  }
  const prefix = await storage.readObjectPrefix(ticket.objectKey, 64);
  if (!hasExpectedImageSignature(prefix, ticket.mimeType)) {
    await storage.deleteObject(ticket.objectKey);
    throw new ValidationError("Nội dung file không phải định dạng ảnh được cho phép");
  }

  try {
    const row = await executeRepository(() => repository.createMediaAsset({
      type: "image",
      provider: "r2",
      visibility: "public",
      status: "ready",
      objectKey: ticket.objectKey,
      publicUrl: storage.getPublicUrl(ticket.objectKey),
      originalFilename: ticket.originalFilename,
      mimeType: ticket.mimeType,
      extension: imageMimeExtensions[ticket.mimeType],
      sizeBytes: metadata.contentLength,
      width: parsed.width ?? null,
      height: parsed.height ?? null,
      alt: parsed.alt,
      checksum: metadata.etag,
      metadata: { purpose: ticket.purpose },
      uploadedBy: currentUser.id,
    }, currentUser.id));
    return mapMediaAsset(row);
  } catch (error) {
    const persisted = await executeRepository(() =>
      repository.findMediaAssetByObjectKey(ticket.objectKey));
    if (persisted) return mapMediaAsset(persisted);
    await storage.deleteObject(ticket.objectKey);
    throw error;
  }
}

export async function deleteMediaAsset(id: string) {
  const currentUser = await requireMediaPermission();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) throw new ValidationError("ID media không hợp lệ", { id: ["ID không hợp lệ"] });

  const repository = await import("@/server/repositories/media.repository");
  const row = await executeRepository(() => repository.findMediaAssetById(parsedId.data));
  if (!row || row.deletedAt) throw new NotFoundError("Media asset", id);
  if (row.provider !== "r2" || !row.objectKey) {
    throw new ConflictError("Chỉ có thể xóa object R2 do Media Library quản lý");
  }
  if (row.status !== "ready") {
    throw new ConflictError("Chỉ có thể xóa media R2 đang ở trạng thái sẵn sàng");
  }

  const deletion = await executeRepository(() =>
    repository.softDeleteMediaAssetIfUnused(parsedId.data, currentUser.id));
  if (deletion.outcome === "not_found") throw new NotFoundError("Media asset", id);
  if (deletion.outcome === "in_use") {
    throw new ConflictError(`Không thể xóa media đang được sử dụng bởi: ${deletion.usage.join(", ")}`);
  }

  try {
    await getMediaStorage().deleteObject(row.objectKey);
  } catch (error) {
    await executeRepository(() =>
      repository.restoreMediaAssetAfterStorageFailure(parsedId.data, currentUser.id));
    throw error;
  }
  return { id: deletion.row.id };
}

export async function createMediaDownloadUrl(id: string) {
  await requireMediaPermission();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) throw new ValidationError("ID media không hợp lệ");
  const repository = await import("@/server/repositories/media.repository");
  const row = await executeRepository(() => repository.findMediaAssetById(parsedId.data));
  if (!row?.objectKey || row.deletedAt) throw new NotFoundError("Media asset", id);
  return getMediaStorage().createDownloadUrl({ objectKey: row.objectKey, expiresInSeconds: 60 });
}
