import "server-only";

import { z } from "zod";

import { ValidationError } from "@/server/errors";
import type { MediaMimeType, MediaPurpose } from "@/types";

export const mediaPurposes = [
  "avatar",
  "campaign_banner",
  "event_banner",
  "gallery",
  "post_cover",
  "post_thumbnail",
  "site_banner",
] as const satisfies readonly MediaPurpose[];

export const mediaMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const satisfies readonly MediaMimeType[];

export const maximumImageSizeBytes = 10 * 1024 * 1024;
const maximumAvatarSizeBytes = 5 * 1024 * 1024;

const uploadRequestSchema = z.object({
  originalFilename: z.string().trim().min(1).max(255),
  mimeType: z.enum(mediaMimeTypes),
  sizeBytes: z.number().int().positive().max(maximumImageSizeBytes),
  purpose: z.enum(mediaPurposes),
});

const confirmUploadSchema = z.object({
  uploadTicket: z.string().min(20).max(2048),
  alt: z.string().trim().max(300).nullable().optional().transform((value) => value || null),
  width: z.number().int().positive().max(30_000).nullable().optional(),
  height: z.number().int().positive().max(30_000).nullable().optional(),
});

const allowedExtensions: Record<MediaMimeType, readonly string[]> = {
  "image/avif": ["avif"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
};

function sanitizeOriginalFilename(value: string) {
  const basename = value.replaceAll("\\", "/").split("/").at(-1) ?? "";
  return basename.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 255);
}

export function parseUploadRequest(input: unknown) {
  const parsed = uploadRequestSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Dữ liệu upload chưa hợp lệ", parsed.error.flatten().fieldErrors);
  }

  const originalFilename = sanitizeOriginalFilename(parsed.data.originalFilename);
  const extension = originalFilename.split(".").at(-1)?.toLowerCase() ?? "";
  if (!originalFilename || !allowedExtensions[parsed.data.mimeType].includes(extension)) {
    throw new ValidationError("Phần mở rộng file không khớp MIME type", {
      originalFilename: ["Chỉ chấp nhận JPG, PNG, WebP hoặc AVIF đúng định dạng"],
    });
  }
  if (parsed.data.purpose === "avatar" && parsed.data.sizeBytes > maximumAvatarSizeBytes) {
    throw new ValidationError("Ảnh avatar vượt quá 5 MB", {
      sizeBytes: ["Ảnh avatar tối đa 5 MB"],
    });
  }

  return { ...parsed.data, originalFilename };
}

export function parseConfirmUpload(input: unknown) {
  const parsed = confirmUploadSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Dữ liệu xác nhận upload chưa hợp lệ", parsed.error.flatten().fieldErrors);
  }
  const widthMissing = parsed.data.width === null || parsed.data.width === undefined;
  const heightMissing = parsed.data.height === null || parsed.data.height === undefined;
  if (widthMissing !== heightMissing) {
    throw new ValidationError("Kích thước ảnh chưa đầy đủ", {
      width: ["Width và height phải được cung cấp cùng nhau"],
    });
  }
  return parsed.data;
}

export function hasExpectedImageSignature(bytes: Uint8Array, mimeType: MediaMimeType) {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((value, index) => bytes[index] === value);
  }
  if (mimeType === "image/webp") {
    const decoder = new TextDecoder();
    return decoder.decode(bytes.slice(0, 4)) === "RIFF" &&
      decoder.decode(bytes.slice(8, 12)) === "WEBP";
  }
  const decoder = new TextDecoder();
  return decoder.decode(bytes.slice(4, 8)) === "ftyp" &&
    /avif|avis/.test(decoder.decode(bytes.slice(8, 32)));
}
