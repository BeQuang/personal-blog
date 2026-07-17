import type { Metadata } from "next";

import { requireAdminPagePermission } from "@/server/auth";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";

export const metadata: Metadata = { title: "Cài đặt" };

export default async function AdminSettingsPage() {
  await requireAdminPagePermission("settings:manage");

  return <AdminSettingsForm />;
}
