import type { Metadata } from "next";

import { AdminGalleryManager } from "@/components/admin/AdminGalleryManager";
import { AdminMediaLibrary } from "@/components/admin/AdminMediaLibrary";
import { hasPermission, requireAdminPagePermission } from "@/server/auth";
import { getAdminGalleryItems } from "@/server/services/gallery.service";
import { getMediaLibrary, getMediaPickerItems } from "@/server/services/media.service";
import type { MediaMimeType, MediaPurpose } from "@/types";

export const metadata: Metadata = { title: "Hình ảnh" };

interface Props { searchParams: Promise<Record<string, string | string[] | undefined>>; }
const mimeTypes = new Set<MediaMimeType>(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const purposes = new Set<MediaPurpose>(["avatar", "campaign_banner", "event_banner", "gallery", "post_cover", "post_thumbnail", "site_banner"]);
const single = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function AdminGalleryPage({ searchParams }: Props) {
  const currentUser = await requireAdminPagePermission("media:manage");
  const parameters = await searchParams;
  const rawMime = single(parameters.mime); const rawPurpose = single(parameters.purpose); const rawPage = Number(single(parameters.page) ?? "1");
  const filters = { query: single(parameters.q)?.trim() ?? "", mimeType: rawMime && mimeTypes.has(rawMime as MediaMimeType) ? rawMime as MediaMimeType : "all" as const, purpose: rawPurpose && purposes.has(rawPurpose as MediaPurpose) ? rawPurpose as MediaPurpose : "all" as const };
  const [items, mediaRows, mediaLibrary] = await Promise.all([getAdminGalleryItems(), getMediaPickerItems(), getMediaLibrary({ page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1, pageSize: 20, query: filters.query, mimeType: filters.mimeType, purpose: filters.purpose })]);
  const mediaOptions = mediaRows.map((item) => ({ id: item.id, label: item.alt || item.originalFilename, publicUrl: item.publicUrl }));
  return <><AdminGalleryManager items={items} mediaOptions={mediaOptions} canWrite canPublish={hasPermission(currentUser.role, "content:publish")} /><AdminMediaLibrary data={mediaLibrary} filters={filters} showHeader={false} /></>;
}
