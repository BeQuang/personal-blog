import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  NotFound,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

import { isSafeImageObjectKey } from "./object-key";
import type {
  CreateDownloadUrlInput,
  CreateUploadUrlInput,
  MediaStorage,
  StoredObjectMetadata,
  StoredObjectSummary,
} from "./storage.types";

const r2ConfigSchema = z.object({
  accessKeyId: z.string().min(1),
  accountId: z.string().trim().regex(/^[a-f0-9]{32}$/i, "R2_ACCOUNT_ID is invalid"),
  bucketName: z.string().trim().min(3),
  publicBaseUrl: z.url()
    .refine((value) => {
      const url = new URL(value);
      return (url.protocol === "https:" || url.protocol === "http:") &&
        !url.username && !url.password && !url.search && !url.hash;
    }, "R2_PUBLIC_BASE_URL must be an HTTP(S) URL without credentials, query, or hash")
    .transform((value) => value.replace(/\/+$/, "")),
  secretAccessKey: z.string().min(1),
});

function getR2Config() {
  return r2ConfigSchema.parse({
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    accountId: process.env.R2_ACCOUNT_ID,
    bucketName: process.env.R2_BUCKET_NAME,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  });
}

function assertSafeObjectKey(objectKey: string) {
  if (!isSafeImageObjectKey(objectKey)) {
    throw new Error("Unsafe R2 object key");
  }
}

export class R2Storage implements MediaStorage {
  private readonly bucketName: string;
  private readonly client: S3Client;
  private readonly publicBaseUrl: string;

  constructor() {
    const config = getR2Config();
    this.bucketName = config.bucketName;
    this.publicBaseUrl = config.publicBaseUrl;
    this.client = new S3Client({
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      region: "auto",
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }

  async createUploadUrl(input: CreateUploadUrlInput) {
    assertSafeObjectKey(input.objectKey);
    return getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: input.objectKey,
        ContentType: input.contentType,
      }),
      { expiresIn: input.expiresInSeconds },
    );
  }

  async createDownloadUrl(input: CreateDownloadUrlInput) {
    assertSafeObjectKey(input.objectKey);
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucketName, Key: input.objectKey }),
      { expiresIn: input.expiresInSeconds },
    );
  }

  async deleteObject(objectKey: string) {
    assertSafeObjectKey(objectKey);
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucketName, Key: objectKey }),
    );
  }

  async objectExists(objectKey: string) {
    return Boolean(await this.getObjectMetadata(objectKey));
  }

  getPublicUrl(objectKey: string) {
    assertSafeObjectKey(objectKey);
    const encodedPath = objectKey.split("/").map(encodeURIComponent).join("/");
    return `${this.publicBaseUrl}/${encodedPath}`;
  }

  async getObjectMetadata(objectKey: string): Promise<StoredObjectMetadata | null> {
    assertSafeObjectKey(objectKey);
    try {
      const result = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucketName, Key: objectKey }),
      );
      return {
        contentLength: result.ContentLength ?? 0,
        contentType: result.ContentType ?? null,
        etag: result.ETag?.replaceAll('"', "") ?? null,
      };
    } catch (error) {
      if (
        error instanceof NotFound ||
        (typeof error === "object" && error !== null && "$metadata" in error &&
          (error.$metadata as { httpStatusCode?: number }).httpStatusCode === 404)
      ) {
        return null;
      }
      throw error;
    }
  }

  async readObjectPrefix(objectKey: string, maximumBytes: number) {
    assertSafeObjectKey(objectKey);
    const safeMaximum = Math.max(1, Math.min(maximumBytes, 512));
    const result = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
        Range: `bytes=0-${safeMaximum - 1}`,
      }),
    );
    if (!result.Body) throw new Error("R2 object body is unavailable");
    return result.Body.transformToByteArray();
  }

  async listObjects(prefix = "images/"): Promise<StoredObjectSummary[]> {
    if (prefix !== "images/") throw new Error("Unsafe R2 list prefix");
    const objects: StoredObjectSummary[] = [];
    let continuationToken: string | undefined;

    do {
      const result = await this.client.send(new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }));
      for (const item of result.Contents ?? []) {
        if (!item.Key || !isSafeImageObjectKey(item.Key)) continue;
        objects.push({
          objectKey: item.Key,
          lastModified: item.LastModified ?? null,
          sizeBytes: item.Size ?? 0,
        });
      }
      continuationToken = result.IsTruncated
        ? result.NextContinuationToken
        : undefined;
    } while (continuationToken);

    return objects;
  }
}
