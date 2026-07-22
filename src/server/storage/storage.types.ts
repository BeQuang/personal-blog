export interface CreateUploadUrlInput {
  objectKey: string;
  contentType: string;
  expiresInSeconds: number;
}

export interface CreateDownloadUrlInput {
  objectKey: string;
  expiresInSeconds: number;
}

export interface StoredObjectMetadata {
  contentLength: number;
  contentType: string | null;
  etag: string | null;
}

export interface StoredObjectSummary {
  objectKey: string;
  lastModified: Date | null;
  sizeBytes: number;
}

export interface MediaStorage {
  createUploadUrl(input: CreateUploadUrlInput): Promise<string>;
  createDownloadUrl(input: CreateDownloadUrlInput): Promise<string>;
  deleteObject(objectKey: string): Promise<void>;
  objectExists(objectKey: string): Promise<boolean>;
  getPublicUrl(objectKey: string): string;
  getObjectMetadata(objectKey: string): Promise<StoredObjectMetadata | null>;
  readObjectPrefix(objectKey: string, maximumBytes: number): Promise<Uint8Array>;
  listObjects(prefix?: string): Promise<StoredObjectSummary[]>;
}
