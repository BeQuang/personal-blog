import type { Metadata } from "next";

import { AdminSocialLinksManager } from "@/components/admin/AdminSocialLinksManager";
import { requireAdminPagePermission } from "@/server/auth";
import { getAdminSocialLinkPage } from "@/server/services/social-links.service";

export const metadata: Metadata = { title: "Mạng xã hội" };

export default async function AdminSocialLinksPage() {
  await requireAdminPagePermission("settings:manage");
  const initialPage = await getAdminSocialLinkPage({});

  return <AdminSocialLinksManager initialPage={initialPage} />;
}
