import type { Metadata } from "next";
import { AdminResourceTable } from "@/components/admin/AdminResourceTable";
import { getAdminRows } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Chiến dịch" };

export default function AdminCampaignsPage() {
  return <AdminResourceTable resource="campaigns" description="Quản lý trạng thái, thời gian và nội dung nổi bật của chiến dịch demo." initialRows={getAdminRows("campaigns")} supportsFeatured />;
}
