import type { Metadata } from "next";
import { AdminResourceTable } from "@/components/admin/AdminResourceTable";
import { getAdminRows } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Mạng xã hội" };

export default function AdminSocialLinksPage() {
  return <AdminResourceTable resource="social-links" description="Bật, tắt và thử nghiệm thông tin các kênh mạng xã hội trong phiên hiện tại." initialRows={getAdminRows("social-links")} />;
}
