import { timingSafeEqual } from "node:crypto";

import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  connectTikTokSocialLink,
  requireTikTokOAuthAccess,
} from "@/server/services/social-links.service";
import { TIKTOK_AUTOMATION_ENABLED } from "@/utils/social-audience";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OAUTH_COOKIE = "tiktok_oauth_state";
const OAUTH_COOKIE_PATH = "/api/auth/tiktok";
const stateCookieSchema = z.object({
  state: z.string().min(32),
  socialLinkId: z.uuid(),
});

function parseStateCookie(value: string | undefined) {
  if (!value) return null;
  try {
    const decoded = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    const parsed = stateCookieSchema.safeParse(decoded);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function stateMatches(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length
    && timingSafeEqual(expectedBuffer, receivedBuffer);
}

function redirectToAdmin(request: NextRequest, status: string) {
  const response = NextResponse.redirect(
    new URL(`/admin/social-links?tiktok=${encodeURIComponent(status)}`, request.url),
  );
  response.headers.set("Cache-Control", "private, no-store");
  response.cookies.set(OAUTH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: OAUTH_COOKIE_PATH,
  });
  return response;
}

export async function GET(request: NextRequest) {
  try {
    await requireTikTokOAuthAccess();
  } catch {
    return redirectToAdmin(
      request,
      TIKTOK_AUTOMATION_ENABLED ? "error" : "disabled",
    );
  }
  const state = request.nextUrl.searchParams.get("state") ?? "";
  const code = request.nextUrl.searchParams.get("code") ?? "";
  const providerError = request.nextUrl.searchParams.get("error");
  const stored = parseStateCookie(request.cookies.get(OAUTH_COOKIE)?.value);
  if (providerError || !stored || !code || !stateMatches(stored.state, state)) {
    return redirectToAdmin(request, providerError ? "cancelled" : "invalid_state");
  }

  try {
    await connectTikTokSocialLink(stored.socialLinkId, code);
    revalidatePath("/", "layout");
    revalidatePath("/admin/social-links");
    revalidatePath("/about");
    revalidatePath("/contact");
    return redirectToAdmin(request, "connected");
  } catch {
    return redirectToAdmin(
      request,
      TIKTOK_AUTOMATION_ENABLED ? "error" : "disabled",
    );
  }
}
