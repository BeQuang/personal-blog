import { NextResponse, type NextRequest } from "next/server";

import { ApplicationError } from "@/server/errors";
import { createVideoDirectUpload } from "@/server/services/videos.service";

export const runtime = "nodejs";

const maximumRequestBytes = 32 * 1024;

function errorResponse(error: unknown) {
  if (error instanceof ApplicationError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  return NextResponse.json(
    { error: "Không thể tạo URL upload video. Vui lòng thử lại." },
    { status: 500 },
  );
}

function allowedCorsOrigin(request: NextRequest) {
  const suppliedOrigin = request.headers.get("origin");
  const allowed = new Set([request.nextUrl.origin]);
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredSiteUrl) {
    try {
      allowed.add(new URL(configuredSiteUrl).origin);
    } catch {
      throw new Error("NEXT_PUBLIC_SITE_URL is not a valid URL");
    }
  }
  if (suppliedOrigin && !allowed.has(suppliedOrigin)) {
    return null;
  }
  return suppliedOrigin ?? request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > maximumRequestBytes) {
    return NextResponse.json({ error: "Request quá lớn." }, { status: 413 });
  }
  const corsOrigin = allowedCorsOrigin(request);
  if (!corsOrigin) {
    return NextResponse.json({ error: "Origin không được phép." }, { status: 403 });
  }

  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > maximumRequestBytes) {
      return NextResponse.json({ error: "Request quá lớn." }, { status: 413 });
    }
    const input: unknown = JSON.parse(rawBody);
    const data = await createVideoDirectUpload(input, corsOrigin);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "JSON không hợp lệ." }, { status: 400 });
    }
    return errorResponse(error);
  }
}
