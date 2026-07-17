import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

if (existsSync(".env.local")) loadEnvFile(".env.local");

async function main() {
  const { createMediaUploadAction } = await import("@/actions/media.actions");
  const { ValidationError } = await import("@/server/errors");
  const { hasPermission } = await import("@/server/auth/permissions");
  const { createImageObjectKey, isSafeImageObjectKey } = await import("@/server/storage/object-key");
  const { R2Storage } = await import("@/server/storage/r2-storage");
  const { createUploadTicket, verifyUploadTicket } = await import("@/server/storage/upload-ticket");
  const {
    hasExpectedImageSignature,
    maximumImageSizeBytes,
    parseUploadRequest,
  } = await import("@/server/validation/media.validation");

  const rejected: string[] = [];
  const mustReject = (label: string, input: unknown) => {
    try {
      parseUploadRequest(input);
    } catch (error) {
      if (error instanceof ValidationError) {
        rejected.push(label);
        return;
      }
      throw error;
    }
    throw new Error(`${label} was unexpectedly accepted`);
  };

  mustReject("svg", {
    originalFilename: "unsafe.svg",
    mimeType: "image/svg+xml",
    purpose: "gallery",
    sizeBytes: 100,
  });
  mustReject("extension-mismatch", {
    originalFilename: "spoofed.png",
    mimeType: "image/jpeg",
    purpose: "gallery",
    sizeBytes: 100,
  });
  mustReject("oversized", {
    originalFilename: "large.webp",
    mimeType: "image/webp",
    purpose: "gallery",
    sizeBytes: maximumImageSizeBytes + 1,
  });

  const svgBytes = new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'></svg>");
  if (hasExpectedImageSignature(svgBytes, "image/png")) {
    throw new Error("SVG content passed the PNG magic-byte check");
  }

  const objectKey = createImageObjectKey("image/png");
  if (!isSafeImageObjectKey(objectKey) || isSafeImageObjectKey("images/2026/99/------------------------------------.png")) {
    throw new Error("Object-key validation accepted an unsafe path");
  }
  const uploadTicket = createUploadTicket({
    expiresAt: Date.now() + 60_000,
    mimeType: "image/png",
    objectKey,
    originalFilename: "safe.png",
    purpose: "gallery",
    sizeBytes: 100,
    uploadedBy: "11111111-1111-4111-8111-111111111111",
  });
  verifyUploadTicket(uploadTicket);
  try {
    verifyUploadTicket(`${uploadTicket.slice(0, -1)}x`);
    throw new Error("Tampered upload ticket was accepted");
  } catch (error) {
    if (!(error instanceof ValidationError)) throw error;
  }

  const originalPublicBaseUrl = process.env.R2_PUBLIC_BASE_URL;
  try {
    process.env.R2_PUBLIC_BASE_URL = "file:///unsafe";
    try {
      new R2Storage();
      throw new Error("Non-HTTP R2 public URL was accepted");
    } catch (error) {
      if (error instanceof Error && error.message === "Non-HTTP R2 public URL was accepted") throw error;
    }
  } finally {
    if (originalPublicBaseUrl === undefined) {
      delete process.env.R2_PUBLIC_BASE_URL;
    } else {
      process.env.R2_PUBLIC_BASE_URL = originalPublicBaseUrl;
    }
  }

  if (!hasPermission("editor", "media:manage") || hasPermission("viewer", "media:manage")) {
    throw new Error("Media permission matrix is incorrect");
  }

  const unauthorized = await createMediaUploadAction({
    originalFilename: "unauthorized.png",
    mimeType: "image/png",
    purpose: "gallery",
    sizeBytes: 100,
  });
  if (unauthorized.success) {
    throw new Error("Unauthenticated presigned URL request unexpectedly succeeded");
  }

  console.log(JSON.stringify({
    magicBytes: "spoofed content rejected",
    objectKey: "unsafe paths rejected",
    permissionMatrix: "editor allowed; viewer denied",
    presignAuthorization: "unauthenticated request denied",
    publicUrlConfig: "non-HTTP URL rejected",
    uploadTicket: "tampering rejected",
    validation: rejected,
  }));
}

void main();
