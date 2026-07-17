"use server";

import { requirePermission } from "@/server/auth";

export async function mockSettingsPermissionAction() {
  const currentUser = await requirePermission("settings:manage");

  return {
    allowed: true,
    role: currentUser.role,
  };
}
