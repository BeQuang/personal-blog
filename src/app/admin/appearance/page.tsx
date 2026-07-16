import type { Metadata } from "next";
import { AdminAppearanceEditor } from "@/components/admin/AdminAppearanceEditor";

export const metadata: Metadata = { title: "Giao diện" };

export default function AdminAppearancePage() {
  return <AdminAppearanceEditor />;
}
