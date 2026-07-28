import type { Metadata } from "next";

import { AdminEventsManager } from "@/components/admin/AdminEventsManager";
import { hasPermission, requireAdminPagePermission } from "@/server/auth";
import { getAdminEventPage } from "@/server/services/events.service";
import { getMediaPickerItems } from "@/server/services/media.service";

export const metadata: Metadata = { title: "Sự kiện" };

export default async function AdminEventsPage() {
  const currentUser = await requireAdminPagePermission("content:view");
  const canWrite = hasPermission(currentUser.role, "content:write");
  const initialPage = await getAdminEventPage({});
  const mediaRows = canWrite ? await getMediaPickerItems() : [];
  const mediaOptions = mediaRows.map((item) => ({ id: item.id, label: item.alt || item.originalFilename, publicUrl: item.publicUrl }));
  return <AdminEventsManager initialPage={initialPage} mediaOptions={mediaOptions} canWrite={canWrite} canPublish={hasPermission(currentUser.role, "content:publish")} />;
}
