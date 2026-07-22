import { analyticsPayloadLimitBytes } from "@/config/analytics.config";
import { createPublicRequestContextFromHeaders } from "@/server/anti-spam/request-context";
import { ApplicationError } from "@/server/errors";
import { ingestClientAnalyticsEvent } from "@/server/services/analytics.service";

function responseHeaders() {
  return {
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  };
}

function getRequestHost(request: Request) {
  return (
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
    || request.headers.get("host")?.trim()
    || new URL(request.url).host
  ).toLowerCase();
}

function hasAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host.toLowerCase() === getRequestHost(request);
  } catch {
    return false;
  }
}

function readCountryCode(request: Request) {
  const value =
    request.headers.get("cf-ipcountry")
    || request.headers.get("x-vercel-ip-country");
  return value && /^[a-z]{2}$/i.test(value) ? value.toUpperCase() : undefined;
}

export async function POST(request: Request) {
  if (!hasAllowedOrigin(request)) {
    return Response.json(
      { error: "Origin không được phép." },
      { status: 403, headers: responseHeaders() },
    );
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return Response.json(
      { error: "Content-Type phải là application/json." },
      { status: 415, headers: responseHeaders() },
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > analyticsPayloadLimitBytes) {
    return Response.json(
      { error: "Analytics payload quá lớn." },
      { status: 413, headers: responseHeaders() },
    );
  }

  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > analyticsPayloadLimitBytes) {
      return Response.json(
        { error: "Analytics payload quá lớn." },
        { status: 413, headers: responseHeaders() },
      );
    }
    const input: unknown = JSON.parse(body);
    const result = await ingestClientAnalyticsEvent(
      input,
      createPublicRequestContextFromHeaders(request.headers),
      {
        userAgent: request.headers.get("user-agent")?.slice(0, 512),
        countryCode: readCountryCode(request),
        requestHost: getRequestHost(request).split(":")[0],
      },
    );

    if (!result.accepted && "retryAfterSeconds" in result) {
      return Response.json(
        { accepted: false },
        {
          status: 429,
          headers: {
            ...responseHeaders(),
            "retry-after": String(result.retryAfterSeconds),
          },
        },
      );
    }

    return Response.json(
      { accepted: result.accepted },
      { status: result.accepted ? 201 : 202, headers: responseHeaders() },
    );
  } catch (error) {
    const status = error instanceof SyntaxError
      ? 400
      : error instanceof ApplicationError
        ? error.statusCode
        : 500;
    return Response.json(
      { error: status >= 500 ? "Không thể ghi analytics event." : "Analytics event chưa hợp lệ." },
      { status, headers: responseHeaders() },
    );
  }
}

