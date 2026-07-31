import type { AdminListPage, AdminSortOrder } from "./admin-list";

export type MediaPurpose =
  | "avatar"
  | "campaign_banner"
  | "event_banner"
  | "gallery"
  | "post_cover"
  | "post_thumbnail"
  | "site_banner";

export type MediaMimeType = "image/jpeg" | "image/png" | "image/webp" | "image/avif";
export type MediaLibrarySortBy = "createdAt" | "originalFilename" | "sizeBytes";

export interface MediaAssetItem {
  id: string;
  originalFilename: string;
  mimeType: MediaMimeType;
  extension: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  purpose: MediaPurpose;
  publicUrl: string;
  createdAt: string;
}

export type MediaLibraryPage = AdminListPage<MediaAssetItem, MediaLibrarySortBy>;

export interface MediaLibraryQuery {
  page?: number;
  pageSize?: number;
  sortBy?: MediaLibrarySortBy;
  sortOrder?: AdminSortOrder;
  query?: string;
  mimeType?: MediaMimeType | "all";
  purpose?: MediaPurpose | "all";
}

export interface CreateMediaUploadInput {
  originalFilename: string;
  mimeType: MediaMimeType;
  sizeBytes: number;
  purpose: MediaPurpose;
}

export interface CreateMediaUploadData {
  uploadUrl: string;
  uploadTicket: string;
  expiresAt: string;
  headers: Readonly<Record<"Content-Type", string>>;
}

export interface ConfirmMediaUploadInput {
  uploadTicket: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface MediaActionResult<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  fieldErrors?: Readonly<Record<string, readonly string[]>>;
}
