import "server-only";

import { AuthorizationError } from "./errors";
import {
  hasPermission,
  hasRole,
  type Permission,
  type UserRole,
} from "./permissions";
import { requireAuth } from "./require-auth";

export async function requireRole(allowedRoles: UserRole | readonly UserRole[]) {
  const currentUser = await requireAuth();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!hasRole(currentUser.role, roles)) {
    throw new AuthorizationError();
  }

  return currentUser;
}

export async function requirePermission(permission: Permission) {
  const currentUser = await requireAuth();

  if (!hasPermission(currentUser.role, permission)) {
    throw new AuthorizationError();
  }

  return currentUser;
}
