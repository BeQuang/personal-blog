import { NextResponse, type NextRequest } from "next/server";

import { syncAuthUserProfile } from "@/server/auth/profile-sync";
import { createSupabaseServerClient } from "@/server/supabase/server";

function getSafeDestination(value: string | null) {
  return value?.startsWith("/admin") && !value.startsWith("//")
    ? value
    : "/admin";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/login?error=callback_failed", request.url),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      new URL("/admin/login?error=callback_failed", request.url),
    );
  }

  const profile = await syncAuthUserProfile(data.user, { recordLogin: true });

  if (profile.status === "disabled") {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/admin/login?error=account_disabled", request.url),
    );
  }

  return NextResponse.redirect(
    new URL(
      getSafeDestination(request.nextUrl.searchParams.get("next")),
      request.url,
    ),
  );
}
