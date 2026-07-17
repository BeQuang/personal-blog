import type { Metadata } from "next";

import { AdminSocialLinksManager } from "@/components/admin/AdminSocialLinksManager";
import { requireAdminPagePermission } from "@/server/auth";
import { getAdminSocialLinks } from "@/server/services/social-links.service";

export const metadata: Metadata = { title: "Mạng xã hội" };

export default async function AdminSocialLinksPage() {
  await requireAdminPagePermission("settings:manage");
  const links = await getAdminSocialLinks();

  return <AdminSocialLinksManager links={links} />;
}
