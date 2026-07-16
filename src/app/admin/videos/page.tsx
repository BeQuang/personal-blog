import type { Metadata } from "next";
import { AdminResourceTable } from "@/components/admin/AdminResourceTable";
import { getAdminRows } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Video" };

export default function AdminVideosPage() {
  return <AdminResourceTable resource="videos" description="Theo dõi video theo nền tảng, hướng hiển thị và trạng thái nổi bật." initialRows={getAdminRows("videos")} supportsFeatured />;
}
