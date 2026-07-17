import type { Metadata } from "next";

import { requireAdminPagePermission } from "@/server/auth";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";
import { getMediaPickerItems } from "@/server/services/media.service";

export const metadata: Metadata = { title: "Cài đặt" };

export default async function AdminSettingsPage() {
  await requireAdminPagePermission("settings:manage");
  const mediaOptions = (await getMediaPickerItems()).map((item) => ({
    id: item.id,
    label: item.alt || item.originalFilename,
    publicUrl: item.publicUrl,
  }));

  return <AdminSettingsForm mediaOptions={mediaOptions} />;
}
