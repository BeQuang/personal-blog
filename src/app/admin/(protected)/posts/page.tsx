import type { Metadata } from "next";

import { requireAdminPagePermission } from "@/server/auth";
import { AdminResourceTable } from "@/components/admin/AdminResourceTable";
import { getAdminRows } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Bài viết" };

export default async function AdminPostsPage() {
  await requireAdminPagePermission("content:view");

  return <AdminResourceTable resource="posts" description="Quản lý bản nháp, lịch xuất bản và nội dung nổi bật bằng dữ liệu tạm." initialRows={getAdminRows("posts")} supportsFeatured />;
}
