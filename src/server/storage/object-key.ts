import "server-only";

import { randomUUID } from "node:crypto";

export const imageMimeExtensions = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type AllowedImageMimeType = keyof typeof imageMimeExtensions;
export type AllowedImageExtension = (typeof imageMimeExtensions)[AllowedImageMimeType];

export function createImageObjectKey(
  mimeType: AllowedImageMimeType,
  referenceDate = new Date(),
) {
  const year = referenceDate.getUTCFullYear();
  const month = String(referenceDate.getUTCMonth() + 1).padStart(2, "0");
  return `images/${year}/${month}/${randomUUID()}.${imageMimeExtensions[mimeType]}`;
}

export function isSafeImageObjectKey(value: string) {
  return /^images\/\d{4}\/(?:0[1-9]|1[0-2])\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp|avif)$/i.test(value);
}
