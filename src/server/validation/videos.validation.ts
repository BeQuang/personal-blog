import "server-only";

import { z } from "zod";

import { ValidationError } from "@/server/errors";

import { httpUrlSchema } from "./url.validation";

const videoPlatforms = ["youtube", "tiktok", "instagram", "facebook", "internal"] as const;
const videoOrientations = ["landscape", "portrait"] as const;
const allowedVideoMimeTypes = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-matroska",
] as const;
const allowedVideoExtensions: Record<(typeof allowedVideoMimeTypes)[number], readonly string[]> = {
  "video/mp4": ["mp4", "m4v"],
  "video/quicktime": ["mov"],
  "video/webm": ["webm"],
  "video/x-matroska": ["mkv"],
};

export const maximumVideoSizeBytes = 5 * 1024 * 1024 * 1024;

const nullableText = (maximum: number) =>
  z.string().trim().max(maximum).nullable().optional().transform((value) => value || null);

const metadataSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: nullableText(2000),
  orientation: z.enum(videoOrientations),
  topic: z.string().trim().min(1).max(100),
  thumbnailMediaId: z.uuid().nullable().optional(),
  featured: z.boolean(),
});

const createUploadSchema = metadataSchema.extend({
  originalFilename: z.string().trim().min(1).max(255),
  mimeType: z.enum(allowedVideoMimeTypes),
  sizeBytes: z.number().int().positive().max(maximumVideoSizeBytes),
  retryVideoId: z.uuid().optional(),
});

const mutationSchema = metadataSchema.extend({
  platform: z.enum(videoPlatforms),
  externalUrl: httpUrlSchema.nullable().optional(),
}).superRefine((value, context) => {
  if (value.platform !== "internal" && !value.externalUrl) {
    context.addIssue({
      code: "custom",
      path: ["externalUrl"],
      message: "Video nền tảng ngoài cần URL hợp lệ",
    });
  }
  if (value.platform === "internal" && value.externalUrl) {
    context.addIssue({
      code: "custom",
      path: ["externalUrl"],
      message: "Video Mux không sử dụng external URL",
    });
  }
});

function sanitizedFilename(value: string) {
  return (value.replaceAll("\\", "/").split("/").at(-1) ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 255);
}

export function parseCreateVideoUpload(input: unknown) {
  const parsed = createUploadSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Dữ liệu upload video chưa hợp lệ", parsed.error.flatten().fieldErrors);
  }
  const originalFilename = sanitizedFilename(parsed.data.originalFilename);
  const extension = originalFilename.split(".").at(-1)?.toLowerCase() ?? "";
  if (!originalFilename || !allowedVideoExtensions[parsed.data.mimeType].includes(extension)) {
    throw new ValidationError("Phần mở rộng video không khớp MIME type", {
      originalFilename: ["Chỉ chấp nhận MP4, MOV, WebM hoặc MKV đúng định dạng"],
    });
  }
  return { ...parsed.data, originalFilename };
}

export function parseVideoMutation(input: unknown) {
  const parsed = mutationSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Dữ liệu video chưa hợp lệ", parsed.error.flatten().fieldErrors);
  }
  return parsed.data;
}
