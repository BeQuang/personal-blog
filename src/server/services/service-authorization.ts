import "server-only";

import { getCurrentUser } from "@/server/auth";
import { hasPermission, type Permission } from "@/server/auth/permissions";
import { ForbiddenError, UnauthorizedError } from "@/server/errors";

export async function requireServicePermission(permission: Permission) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.status !== "active") {
    throw new UnauthorizedError();
  }

  if (!hasPermission(currentUser.role, permission)) {
    throw new ForbiddenError();
  }

  return currentUser;
}
