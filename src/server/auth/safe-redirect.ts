import "server-only";

export function getSafeAdminDestination(value?: string | null) {
  if (
    value &&
    value.startsWith("/admin") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !value.startsWith("/admin/login")
  ) {
    return value;
  }

  return "/admin";
}
