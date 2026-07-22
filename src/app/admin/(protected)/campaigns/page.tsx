import type { Metadata } from "next";

import { AdminCampaignsManager } from "@/components/admin/AdminCampaignsManager";
import { hasPermission, requireAdminPagePermission } from "@/server/auth";
import { getAdminCampaigns } from "@/server/services/campaigns.service";
import { getMediaPickerItems } from "@/server/services/media.service";

export const metadata: Metadata = { title: "Chiến dịch" };

export default async function AdminCampaignsPage() {
  const currentUser = await requireAdminPagePermission("content:view");
  const canWrite = hasPermission(currentUser.role, "content:write");
  const [campaigns, mediaRows] = await Promise.all([getAdminCampaigns(), canWrite ? getMediaPickerItems() : Promise.resolve([])]);
  const mediaOptions = mediaRows.map((item) => ({ id: item.id, label: item.alt || item.originalFilename, publicUrl: item.publicUrl }));
  return <AdminCampaignsManager campaigns={campaigns} mediaOptions={mediaOptions} canWrite={canWrite} canPublish={hasPermission(currentUser.role, "content:publish")} />;
}
