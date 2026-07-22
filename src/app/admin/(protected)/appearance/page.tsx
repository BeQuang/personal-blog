import type { Metadata } from "next";

import { requireAdminPagePermission } from "@/server/auth";
import { AdminAppearanceEditor } from "@/components/admin/AdminAppearanceEditor";
import { getAdminSiteSettings } from "@/server/services/settings.service";

export const metadata: Metadata = { title: "Giao diện" };

export default async function AdminAppearancePage() {
  await requireAdminPagePermission("settings:manage");
  const settings = await getAdminSiteSettings();

  return <AdminAppearanceEditor initialSettings={settings} />;
}
