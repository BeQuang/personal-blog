import "server-only";

import { createHash } from "node:crypto";

import { headers } from "next/headers";

export interface PublicRequestContext {
  fingerprint: string;
  ipAddress?: string;
}

function readClientIp(requestHeaders: Headers) {
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const candidate = forwardedFor?.split(",")[0]?.trim()
    || requestHeaders.get("x-real-ip")?.trim()
    || requestHeaders.get("cf-connecting-ip")?.trim();
  return candidate && candidate.length <= 64 ? candidate : undefined;
}

export async function createPublicRequestContext(): Promise<PublicRequestContext> {
  const requestHeaders = await headers();
  const ipAddress = readClientIp(requestHeaders);
  const userAgent = requestHeaders.get("user-agent")?.slice(0, 256) ?? "unknown";
  const fingerprint = createHash("sha256")
    .update(ipAddress ?? `unknown-ip|${userAgent}`)
    .digest("hex");

  return {
    fingerprint,
    ...(ipAddress ? { ipAddress } : {}),
  };
}
