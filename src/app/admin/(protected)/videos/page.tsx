import type { Metadata } from "next";

import { AdminVideosManager } from "@/components/admin/AdminVideosManager";
import { hasPermission, requireAdminPagePermission } from "@/server/auth";
import { getAdminVideoPage, getVideoMediaOptions } from "@/server/services/videos.service";

export const metadata: Metadata = { title: "Video" };

export default async function AdminVideosPage() {
  const currentUser = await requireAdminPagePermission("media:manage");
  // The paged read already runs COUNT + items together; keep the media lookup
  // sequential so one render cannot exceed the small production pool.
  const initialPage = await getAdminVideoPage({});
  const mediaOptions = await getVideoMediaOptions();

  return (
    <AdminVideosManager
      initialPage={initialPage}
      mediaOptions={mediaOptions}
      canWrite={hasPermission(currentUser.role, "content:write")}
      canPublish={hasPermission(currentUser.role, "content:publish")}
    />
  );
}
