import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser } from "./current-user";

export async function requireAuth() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/admin/login");
  }

  if (currentUser.status === "disabled") {
    redirect("/admin/login?error=account_disabled");
  }

  return currentUser;
}
