"use client";

import {
  confirmMediaUploadAction,
  createMediaUploadAction,
} from "@/actions/media.actions";
import { withLoadingProgress } from "@/lib/loading-progress";
import type {
  MediaAssetItem,
  MediaMimeType,
  MediaPurpose,
} from "@/types";

export const acceptedMediaImageTypes =
  "image/jpeg,image/png,image/webp,image/avif";

export const maximumMediaImageSizeBytes = 10 * 1024 * 1024;
export const maximumAvatarImageSizeBytes = 5 * 1024 * 1024;

const allowedMimeTypes: readonly MediaMimeType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export function validateMediaImageFile(file: File, purpose: MediaPurpose) {
  if (!allowedMimeTypes.includes(file.type as MediaMimeType)) {
    throw new Error("Chỉ chấp nhận ảnh JPEG, PNG, WebP hoặc AVIF.");
  }

  const maximumSize = purpose === "avatar"
    ? maximumAvatarImageSizeBytes
    : maximumMediaImageSizeBytes;
  if (file.size <= 0 || file.size > maximumSize) {
    throw new Error(
      `File phải có dung lượng từ 1 byte đến ${maximumSize / 1024 / 1024} MB.`,
    );
  }
}

async function readImageDimensions(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  } catch {
    return { width: null, height: null };
  }
}

interface UploadMediaImageInput {
  file: File;
  purpose: MediaPurpose;
  alt?: string | null;
}

export async function uploadMediaImage({
  file,
  purpose,
  alt,
}: UploadMediaImageInput): Promise<MediaAssetItem> {
  validateMediaImageFile(file, purpose);

  const upload = await createMediaUploadAction({
    originalFilename: file.name,
    mimeType: file.type as MediaMimeType,
    sizeBytes: file.size,
    purpose,
  });
  if (!upload.success || !upload.data) {
    throw new Error(upload.message);
  }
  const uploadData = upload.data;

  const response = await withLoadingProgress(() => fetch(uploadData.uploadUrl, {
    method: "PUT",
    headers: uploadData.headers,
    body: file,
  }));
  if (!response.ok) {
    throw new Error(`Tải ảnh lên R2 thất bại (HTTP ${response.status}).`);
  }

  const dimensions = await readImageDimensions(file);
  const confirmed = await confirmMediaUploadAction({
    uploadTicket: uploadData.uploadTicket,
    alt: alt?.trim() || null,
    ...dimensions,
  });
  if (!confirmed.success || !confirmed.data) {
    throw new Error(confirmed.message);
  }

  return confirmed.data;
}
