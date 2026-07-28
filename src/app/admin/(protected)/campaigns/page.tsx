import type { Metadata } from "next";

import { AdminCampaignsManager } from "@/components/admin/AdminCampaignsManager";
import { hasPermission, requireAdminPagePermission } from "@/server/auth";
import { getAdminCampaignPage } from "@/server/services/campaigns.service";
import { getMediaPickerItems } from "@/server/services/media.service";

export const metadata: Metadata = { title: "Chiến dịch" };

export default async function AdminCampaignsPage() {
  const currentUser = await requireAdminPagePermission("content:view");
  const canWrite = hasPermission(currentUser.role, "content:write");
  const initialPage = await getAdminCampaignPage({});
  const mediaRows = canWrite ? await getMediaPickerItems() : [];
  const mediaOptions = mediaRows.map((item) => ({ id: item.id, label: item.alt || item.originalFilename, publicUrl: item.publicUrl }));
  return <AdminCampaignsManager initialPage={initialPage} mediaOptions={mediaOptions} canWrite={canWrite} canPublish={hasPermission(currentUser.role, "content:publish")} />;
}
