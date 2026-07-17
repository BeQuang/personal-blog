import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

if (existsSync(".env.local")) loadEnvFile(".env.local");

async function main() {
  const { createImageObjectKey } = await import("@/server/storage/object-key");
  const { getMediaStorage } = await import("@/server/storage/media-storage");
  const storage = getMediaStorage();
  const objectKey = createImageObjectKey("image/png");
  const image = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2tN8AAAAASUVORK5CYII=",
    "base64",
  );
  let uploaded = false;

  try {
  const uploadUrl = await storage.createUploadUrl({
    objectKey,
    contentType: "image/png",
    expiresInSeconds: 60,
  });
  const applicationOrigin = new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ).origin;
  const preflightResponse = await fetch(uploadUrl, {
    method: "OPTIONS",
    headers: {
      Origin: applicationOrigin,
      "Access-Control-Request-Headers": "content-type",
      "Access-Control-Request-Method": "PUT",
    },
  });
  const allowedOrigin = preflightResponse.headers.get("access-control-allow-origin");
  const allowedMethods = preflightResponse.headers.get("access-control-allow-methods") ?? "";
  if (
    !preflightResponse.ok ||
    (allowedOrigin !== "*" && allowedOrigin !== applicationOrigin) ||
    !allowedMethods.toUpperCase().includes("PUT")
  ) {
    throw new Error(`R2 CORS does not allow direct PUT uploads from ${applicationOrigin}`);
  }
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/png" },
    body: image,
  });
  if (!uploadResponse.ok) {
    throw new Error(`Presigned upload failed with HTTP ${uploadResponse.status}`);
  }
  uploaded = true;

  if (!(await storage.objectExists(objectKey))) {
    throw new Error("Uploaded object was not found by HEAD");
  }
  const metadata = await storage.getObjectMetadata(objectKey);
  if (metadata?.contentLength !== image.length || metadata.contentType !== "image/png") {
    throw new Error("Uploaded object metadata does not match the request");
  }
  const prefix = await storage.readObjectPrefix(objectKey, 8);
  if (!Buffer.from(prefix).equals(image.subarray(0, 8))) {
    throw new Error("Ranged object read returned unexpected bytes");
  }

  const downloadUrl = await storage.createDownloadUrl({ objectKey, expiresInSeconds: 60 });
  const downloadResponse = await fetch(downloadUrl);
  const downloaded = Buffer.from(await downloadResponse.arrayBuffer());
  if (!downloadResponse.ok || !downloaded.equals(image)) {
    throw new Error("Presigned download did not return the uploaded image");
  }
  const publicUrl = new URL(storage.getPublicUrl(objectKey));
  const publicResponse = await fetch(publicUrl);
  const publicImage = Buffer.from(await publicResponse.arrayBuffer());
  if (!publicResponse.ok || !publicImage.equals(image)) {
    throw new Error("R2 public URL did not return the uploaded image");
  }

  console.log(JSON.stringify({
    corsPreflight: "passed",
    download: "passed",
    headMetadata: "passed",
    objectKeyFormat: objectKey.startsWith("images/") ? "passed" : "failed",
    publicUrl: "passed",
    rangedRead: "passed",
    upload: "passed",
  }));
  } finally {
    if (uploaded) {
      await storage.deleteObject(objectKey);
      if (await storage.objectExists(objectKey)) {
        throw new Error("Storage smoke-test object was not deleted");
      }
    }
  }
}

void main();
