import type { Metadata } from "next";

import { requireAdminPagePermission } from "@/server/auth";
import { AdminResourceTable } from "@/components/admin/AdminResourceTable";
import { getAdminRows } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Chiến dịch" };

export default async function AdminCampaignsPage() {
  await requireAdminPagePermission("content:view");

  return <AdminResourceTable resource="campaigns" description="Quản lý trạng thái, thời gian và nội dung nổi bật của chiến dịch demo." initialRows={getAdminRows("campaigns")} supportsFeatured />;
}
