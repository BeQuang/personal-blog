import type { Metadata } from "next";

import { requireAdminPagePermission } from "@/server/auth";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";
import { getMediaPickerItems } from "@/server/services/media.service";
import { getAdminSiteSettings } from "@/server/services/settings.service";

export const metadata: Metadata = { title: "Cài đặt" };

export default async function AdminSettingsPage() {
  await requireAdminPagePermission("settings:manage");
  const [settings, mediaRows] = await Promise.all([getAdminSiteSettings(), getMediaPickerItems()]);
  const mediaOptions = mediaRows.map((item) => ({
    id: item.id,
    label: item.alt || item.originalFilename,
    publicUrl: item.publicUrl,
  }));

  return <AdminSettingsForm initialSettings={settings} mediaOptions={mediaOptions} />;
}
