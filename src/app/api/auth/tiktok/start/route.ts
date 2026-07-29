import { randomBytes } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { prepareTikTokOAuthStart } from "@/server/services/social-links.service";
import { TIKTOK_AUTOMATION_ENABLED } from "@/utils/social-audience";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OAUTH_COOKIE = "tiktok_oauth_state";
const OAUTH_COOKIE_PATH = "/api/auth/tiktok";

export async function GET(request: NextRequest) {
  const socialLinkId = request.nextUrl.searchParams.get("socialLinkId") ?? "";
  const state = randomBytes(32).toString("base64url");
  try {
    const prepared = await prepareTikTokOAuthStart(socialLinkId, state);
    const response = NextResponse.redirect(prepared.authorizationUrl);
    response.headers.set("Cache-Control", "private, no-store");
    response.cookies.set(OAUTH_COOKIE, Buffer.from(JSON.stringify({
      state,
      socialLinkId: prepared.socialLinkId,
    })).toString("base64url"), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60,
      path: OAUTH_COOKIE_PATH,
    });
    return response;
  } catch {
    return NextResponse.redirect(
      new URL(
        `/admin/social-links?tiktok=${
          TIKTOK_AUTOMATION_ENABLED ? "configuration_error" : "disabled"
        }`,
        request.url,
      ),
    );
  }
}
