import { NextResponse, type NextRequest } from "next/server";

import {
  processVerifiedVideoEvent,
  verifyVideoWebhook,
} from "@/server/services/videos.service";

export const runtime = "nodejs";

const maximumWebhookBytes = 1024 * 1024;

export async function POST(request: NextRequest) {
  const signature = request.headers.get("mux-signature");
  if (!signature) {
    return NextResponse.json({ error: "Thiếu chữ ký webhook." }, { status: 400 });
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > maximumWebhookBytes) {
    return NextResponse.json({ error: "Webhook payload quá lớn." }, { status: 413 });
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > maximumWebhookBytes) {
    return NextResponse.json({ error: "Webhook payload quá lớn." }, { status: 413 });
  }

  let event;
  try {
    event = await verifyVideoWebhook(rawBody, signature);
  } catch {
    return NextResponse.json({ error: "Webhook không hợp lệ." }, { status: 400 });
  }

  try {
    const result = await processVerifiedVideoEvent(event);
    return NextResponse.json({ received: true, outcome: result.outcome });
  } catch {
    return NextResponse.json({ error: "Không thể xử lý webhook." }, { status: 500 });
  }
}
