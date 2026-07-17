import type { Metadata } from "next";

import { requireAdminPagePermission } from "@/server/auth";
import { AdminResourceTable } from "@/components/admin/AdminResourceTable";
import { getAdminRows } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Sự kiện" };

export default async function AdminEventsPage() {
  await requireAdminPagePermission("content:view");

  return <AdminResourceTable resource="events" description="Theo dõi lịch, trạng thái và nội dung nổi bật của các sự kiện mock." initialRows={getAdminRows("events")} supportsFeatured />;
}
