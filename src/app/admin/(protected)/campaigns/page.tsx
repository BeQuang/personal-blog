import type { Metadata } from "next";

import { requireAdminPagePermission } from "@/server/auth";
import { AdminResourceTable } from "@/components/admin/AdminResourceTable";
import { getAdminRows } from "@/lib/admin-data";
import { getMediaPickerItems } from "@/server/services/media.service";

export const metadata: Metadata = { title: "Chiến dịch" };

export default async function AdminCampaignsPage() {
  await requireAdminPagePermission("content:view");
  const mediaOptions = (await getMediaPickerItems()).map((item) => ({
    id: item.id,
    label: item.alt || item.originalFilename,
    publicUrl: item.publicUrl,
  }));

  return <AdminResourceTable resource="campaigns" description="Quản lý trạng thái, thời gian và nội dung nổi bật của chiến dịch demo." initialRows={getAdminRows("campaigns")} mediaOptions={mediaOptions} supportsFeatured />;
}
