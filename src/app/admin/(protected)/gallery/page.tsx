import type { Metadata } from "next";

import { AdminGalleryWorkspace } from "@/components/admin/AdminGalleryWorkspace";
import { parseAdminTablePageSize } from "@/components/admin/admin-table.config";
import { hasPermission, requireAdminPagePermission } from "@/server/auth";
import {
  getAdminGalleryCategories,
  getAdminGalleryItemPage,
} from "@/server/services/gallery.service";
import { getMediaLibrary, getMediaPickerItems } from "@/server/services/media.service";
import type {
  AdminSortOrder,
  MediaLibrarySortBy,
  MediaMimeType,
  MediaPurpose,
} from "@/types";

export const metadata: Metadata = { title: "Hình ảnh" };

interface Props { searchParams: Promise<Record<string, string | string[] | undefined>>; }
const mimeTypes = new Set<MediaMimeType>(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const purposes = new Set<MediaPurpose>(["avatar", "campaign_banner", "event_banner", "gallery", "post_cover", "post_thumbnail", "site_banner"]);
const mediaSortFields = new Set<MediaLibrarySortBy>(["createdAt", "originalFilename", "sizeBytes"]);
const single = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function AdminGalleryPage({ searchParams }: Props) {
  const currentUser = await requireAdminPagePermission("media:manage");
  const parameters = await searchParams;
  const activeTab = single(parameters.tab) === "library" ? "library" : "gallery";

  if (activeTab === "gallery") {
    // The paged Gallery query already uses COUNT + items. Keep the bounded
    // category/picker lookups sequential so one render respects the pool.
    const initialPage = await getAdminGalleryItemPage({});
    const categories = await getAdminGalleryCategories();
    const mediaRows = await getMediaPickerItems();
    const mediaOptions = mediaRows.map((item) => ({
      id: item.id,
      label: item.alt || item.originalFilename,
      publicUrl: item.publicUrl,
    }));

    return (
      <AdminGalleryWorkspace
        activeTab="gallery"
        gallery={{
          initialPage,
          categories,
          mediaOptions,
          canWrite: true,
          canPublish: hasPermission(currentUser.role, "content:publish"),
        }}
      />
    );
  }

  const rawMime = single(parameters.mime);
  const rawPurpose = single(parameters.purpose);
  const rawSortBy = single(parameters.sortBy);
  const rawSortOrder = single(parameters.sortOrder);
  const filters = {
    query: single(parameters.q)?.trim() ?? "",
    mimeType: rawMime && mimeTypes.has(rawMime as MediaMimeType)
      ? rawMime as MediaMimeType
      : "all" as const,
    purpose: rawPurpose && purposes.has(rawPurpose as MediaPurpose)
      ? rawPurpose as MediaPurpose
      : "all" as const,
  };
  const mediaLibrary = await getMediaLibrary({
    page: 1,
    pageSize: parseAdminTablePageSize(undefined),
    sortBy: rawSortBy && mediaSortFields.has(rawSortBy as MediaLibrarySortBy)
      ? rawSortBy as MediaLibrarySortBy
      : "createdAt",
    sortOrder: (rawSortOrder === "asc" || rawSortOrder === "desc"
      ? rawSortOrder
      : "desc") as AdminSortOrder,
    query: filters.query,
    mimeType: filters.mimeType,
    purpose: filters.purpose,
  });

  return (
    <AdminGalleryWorkspace
      activeTab="library"
      library={{ data: mediaLibrary, filters }}
    />
  );
}
