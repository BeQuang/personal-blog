"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser } from "@/server/auth";
import { syncAuthUserProfile } from "@/server/auth/profile-sync";
import { createSupabaseServerClient } from "@/server/supabase/server";
import type { LoginActionState } from "@/types";

const loginSchema = z.object({
  email: z.email("Email không hợp lệ").trim(),
  next: z.string().trim().optional(),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

function getSafeAdminDestination(value?: string) {
  if (
    value &&
    value.startsWith("/admin") &&
    !value.startsWith("//") &&
    !value.startsWith("/admin/login")
  ) {
    return value;
  }

  return "/admin";
}

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    next: formData.get("next"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { message: "Email hoặc mật khẩu không đúng." };
  }

  const profile = await syncAuthUserProfile(data.user, { recordLogin: true });

  if (profile.status === "disabled") {
    await supabase.auth.signOut();
    return { message: "Tài khoản này đã bị vô hiệu hóa." };
  }

  redirect(getSafeAdminDestination(parsed.data.next));
}

export async function logoutAction() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/admin/login");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("Không thể đăng xuất phiên hiện tại");
  }

  redirect("/admin/login?status=logged_out");
}
