import { timingSafeEqual } from "node:crypto";

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { syncSocialLinkAudience } from "@/server/services/social-links.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function hasValidCronSecret(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const received = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length
    && timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function GET(request: Request) {
  if (!hasValidCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncSocialLinkAudience();
  revalidatePath("/", "layout");
  revalidatePath("/admin/social-links");
  revalidatePath("/about");
  revalidatePath("/contact");
  return NextResponse.json({ ok: true, ...result });
}
