import type { Metadata } from "next";

import { requireAdminPagePermission } from "@/server/auth";
import { AdminAppearanceEditor } from "@/components/admin/AdminAppearanceEditor";

export const metadata: Metadata = { title: "Giao diện" };

export default async function AdminAppearancePage() {
  await requireAdminPagePermission("settings:manage");

  return <AdminAppearanceEditor />;
}
