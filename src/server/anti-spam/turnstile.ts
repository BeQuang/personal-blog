import "server-only";

import { z } from "zod";

const siteverifyResponseSchema = z.object({
  success: z.boolean(),
  action: z.string().optional(),
  hostname: z.string().optional(),
  "error-codes": z.array(z.string()).optional(),
});

export type TurnstileAction = "contact" | "newsletter" | "campaign_submission";

export interface TurnstileVerification {
  success: boolean;
  errorCode?: string;
}

export async function verifyTurnstileToken(
  token: string,
  expectedAction: TurnstileAction,
  remoteIp?: string,
): Promise<TurnstileVerification> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    return { success: false, errorCode: "TURNSTILE_NOT_CONFIGURED" };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      },
    );
    if (!response.ok) {
      return { success: false, errorCode: "TURNSTILE_UNAVAILABLE" };
    }

    const parsed = siteverifyResponseSchema.safeParse(await response.json());
    if (!parsed.success || !parsed.data.success) {
      return {
        success: false,
        errorCode: parsed.success
          ? parsed.data["error-codes"]?.[0] ?? "TURNSTILE_REJECTED"
          : "TURNSTILE_INVALID_RESPONSE",
      };
    }

    if (parsed.data.action !== expectedAction) {
      return { success: false, errorCode: "TURNSTILE_ACTION_MISMATCH" };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (siteUrl) {
      let expectedHostname: string;
      try {
        expectedHostname = new URL(siteUrl).hostname;
      } catch {
        return { success: false, errorCode: "SITE_URL_INVALID" };
      }
      if (parsed.data.hostname !== expectedHostname) {
        return { success: false, errorCode: "TURNSTILE_HOSTNAME_MISMATCH" };
      }
    }

    return { success: true };
  } catch {
    return { success: false, errorCode: "TURNSTILE_UNAVAILABLE" };
  }
}
