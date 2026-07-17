import type { Metadata } from "next";

import { requireAdminPagePermission } from "@/server/auth";
import { AdminMediaLibrary } from "@/components/admin/AdminMediaLibrary";
import { getMediaLibrary } from "@/server/services/media.service";
import type { MediaMimeType, MediaPurpose } from "@/types";

export const metadata: Metadata = { title: "Hình ảnh" };

interface AdminGalleryPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const mimeTypes = new Set<MediaMimeType>(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const purposes = new Set<MediaPurpose>(["avatar", "campaign_banner", "event_banner", "gallery", "post_cover", "post_thumbnail", "site_banner"]);

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminGalleryPage({ searchParams }: AdminGalleryPageProps) {
  await requireAdminPagePermission("media:manage");
  const parameters = await searchParams;
  const rawMime = single(parameters.mime);
  const rawPurpose = single(parameters.purpose);
  const rawPage = Number(single(parameters.page) ?? "1");
  const filters = {
    query: single(parameters.q)?.trim() ?? "",
    mimeType: rawMime && mimeTypes.has(rawMime as MediaMimeType) ? rawMime as MediaMimeType : "all" as const,
    purpose: rawPurpose && purposes.has(rawPurpose as MediaPurpose) ? rawPurpose as MediaPurpose : "all" as const,
  };
  const data = await getMediaLibrary({
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: 20,
    query: filters.query,
    mimeType: filters.mimeType,
    purpose: filters.purpose,
  });

  return <AdminMediaLibrary data={data} filters={filters} />;
}
