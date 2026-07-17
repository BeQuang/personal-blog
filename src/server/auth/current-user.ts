import "server-only";

import { cache } from "react";

import { createSupabaseServerClient } from "@/server/supabase/server";

import type { UserRole } from "./permissions";
import { findProfileById, syncAuthUserProfile } from "./profile-sync";

export type CurrentUser = {
  id: string;
  email: string | null;
  displayName: string;
  role: UserRole;
  status: "active" | "disabled";
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  const profile =
    (await findProfileById(data.user.id)) ??
    (await syncAuthUserProfile(data.user));

  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.displayName,
    role: profile.role,
    status: profile.status,
  };
});
