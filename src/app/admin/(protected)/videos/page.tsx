import type { Metadata } from "next";

import { AdminVideosManager } from "@/components/admin/AdminVideosManager";
import { hasPermission, requireAdminPagePermission } from "@/server/auth";
import { getAdminVideos, getVideoMediaOptions } from "@/server/services/videos.service";

export const metadata: Metadata = { title: "Video" };

export default async function AdminVideosPage() {
  const currentUser = await requireAdminPagePermission("media:manage");
  const [videos, mediaOptions] = await Promise.all([
    getAdminVideos(),
    getVideoMediaOptions(),
  ]);

  return (
    <AdminVideosManager
      videos={videos}
      mediaOptions={mediaOptions}
      canWrite={hasPermission(currentUser.role, "content:write")}
      canPublish={hasPermission(currentUser.role, "content:publish")}
    />
  );
}
