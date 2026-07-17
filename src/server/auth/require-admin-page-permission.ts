import "server-only";

import { redirect } from "next/navigation";

import { AuthorizationError } from "./errors";
import type { Permission } from "./permissions";
import { requirePermission } from "./require-permission";

export async function requireAdminPagePermission(permission: Permission) {
  try {
    return await requirePermission(permission);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/admin?error=forbidden");
    }

    throw error;
  }
}
