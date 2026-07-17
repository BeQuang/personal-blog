import type { Metadata } from "next";

import { requireAdminPagePermission } from "@/server/auth";
import { AdminResourceTable } from "@/components/admin/AdminResourceTable";
import { getAdminRows } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Hình ảnh" };

export default async function AdminGalleryPage() {
  await requireAdminPagePermission("media:manage");

  return <AdminResourceTable resource="gallery" description="Quản lý danh sách ảnh và danh mục hiển thị; không thực hiện upload thật." initialRows={getAdminRows("gallery")} />;
}
