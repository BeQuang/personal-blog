export const userRoles = ["super_admin", "admin", "editor", "viewer"] as const;

export type UserRole = (typeof userRoles)[number];

export const permissions = [
  "dashboard:view",
  "content:view",
  "content:write",
  "content:publish",
  "media:manage",
  "submissions:view",
  "submissions:manage",
  "submissions:export",
  "analytics:view",
  "settings:manage",
  "users:manage",
  "audit:view",
] as const;

export type Permission = (typeof permissions)[number];

export const permissionMatrix = {
  super_admin: permissions,
  admin: [
    "dashboard:view",
    "content:view",
    "content:write",
    "content:publish",
    "media:manage",
    "submissions:view",
    "submissions:manage",
    "submissions:export",
    "analytics:view",
    "settings:manage",
    "audit:view",
  ],
  editor: [
    "dashboard:view",
    "content:view",
    "content:write",
    "media:manage",
  ],
  viewer: ["dashboard:view", "analytics:view"],
} as const satisfies Record<UserRole, readonly Permission[]>;

export function hasPermission(role: UserRole, permission: Permission) {
  const rolePermissions: readonly Permission[] = permissionMatrix[role];
  return rolePermissions.includes(permission);
}

export function hasRole(role: UserRole, allowedRoles: readonly UserRole[]) {
  return allowedRoles.includes(role);
}
