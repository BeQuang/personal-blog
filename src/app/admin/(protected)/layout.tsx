import { AdminShell } from "@/components/admin/AdminShell";
import { requirePermission } from "@/server/auth";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await requirePermission("dashboard:view");

  return <AdminShell currentUser={currentUser}>{children}</AdminShell>;
}
