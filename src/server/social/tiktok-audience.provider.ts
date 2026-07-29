import "server-only";

import { z } from "zod";

const TIKTOK_API_ORIGIN = "https://open.tiktokapis.com";
const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_SCOPES = [
  "user.info.basic",
  "user.info.profile",
  "user.info.stats",
] as const;

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().int().positive(),
  open_id: z.string().min(1),
  refresh_expires_in: z.number().int().positive(),
  refresh_token: z.string().min(1),
  scope: z.string().min(1),
  token_type: z.string().min(1),
});

const providerErrorSchema = z.object({
  error: z.string().optional(),
  error_description: z.string().optional(),
});

const profileResponseSchema = z.object({
  data: z.object({
    user: z.object({
      open_id: z.string().min(1),
      username: z.string().optional(),
      display_name: z.string().optional(),
      profile_deep_link: z.string().url().optional(),
      follower_count: z.number().int().nonnegative(),
      likes_count: z.number().int().nonnegative(),
    }),
  }),
  error: z.object({
    code: z.union([z.string(), z.number()]),
    message: z.string().optional(),
    log_id: z.string().optional(),
  }),
});

export interface TikTokTokenBundle {
  accessToken: string;
  refreshToken: string;
  openId: string;
  scopes: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

export interface TikTokAudienceResult {
  openId: string;
  username: string | null;
  displayName: string | null;
  profileUrl: string | null;
  followerCount: number;
  likesCount: number;
}

function getTikTokConfig() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();
  const redirectUri = process.env.TIKTOK_REDIRECT_URI?.trim();
  if (!clientKey || !clientSecret || !redirectUri) {
    throw new Error(
      "Thiếu cấu hình TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET hoặc TIKTOK_REDIRECT_URI.",
    );
  }
  return { clientKey, clientSecret, redirectUri };
}

async function parseProviderResponse(response: Response) {
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const providerError = providerErrorSchema.safeParse(body);
    const detail = providerError.success
      ? providerError.data.error_description ?? providerError.data.error
      : null;
    throw new Error(
      detail
        ? `TikTok từ chối yêu cầu: ${detail.slice(0, 300)}`
        : `TikTok API trả về HTTP ${response.status}.`,
    );
  }
  return body;
}

function mapTokenBundle(parsed: z.infer<typeof tokenResponseSchema>): TikTokTokenBundle {
  const issuedAt = Date.now();
  return {
    accessToken: parsed.access_token,
    refreshToken: parsed.refresh_token,
    openId: parsed.open_id,
    scopes: parsed.scope,
    accessTokenExpiresAt: new Date(issuedAt + parsed.expires_in * 1000),
    refreshTokenExpiresAt: new Date(issuedAt + parsed.refresh_expires_in * 1000),
  };
}

export function createTikTokAuthorizationUrl(state: string) {
  const { clientKey, redirectUri } = getTikTokConfig();
  const query = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    scope: TIKTOK_SCOPES.join(","),
    redirect_uri: redirectUri,
    state,
  });
  return `${TIKTOK_AUTH_URL}?${query.toString()}`;
}

export async function exchangeTikTokAuthorizationCode(
  code: string,
  fetchImplementation: typeof fetch = fetch,
) {
  const { clientKey, clientSecret, redirectUri } = getTikTokConfig();
  const response = await fetchImplementation(`${TIKTOK_API_ORIGIN}/v2/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const parsed = tokenResponseSchema.safeParse(await parseProviderResponse(response));
  if (!parsed.success) throw new Error("Phản hồi token từ TikTok không hợp lệ.");
  return mapTokenBundle(parsed.data);
}

export async function refreshTikTokAccessToken(
  refreshToken: string,
  fetchImplementation: typeof fetch = fetch,
) {
  const { clientKey, clientSecret } = getTikTokConfig();
  const response = await fetchImplementation(`${TIKTOK_API_ORIGIN}/v2/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const parsed = tokenResponseSchema.safeParse(await parseProviderResponse(response));
  if (!parsed.success) throw new Error("Phản hồi làm mới token từ TikTok không hợp lệ.");
  return mapTokenBundle(parsed.data);
}

export async function fetchTikTokAudience(
  accessToken: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<TikTokAudienceResult> {
  const fields = [
    "open_id",
    "username",
    "display_name",
    "profile_deep_link",
    "follower_count",
    "likes_count",
  ].join(",");
  const response = await fetchImplementation(
    `${TIKTOK_API_ORIGIN}/v2/user/info/?fields=${encodeURIComponent(fields)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    },
  );
  const parsed = profileResponseSchema.safeParse(await parseProviderResponse(response));
  if (!parsed.success) throw new Error("Phản hồi thông tin tài khoản TikTok không hợp lệ.");
  if (parsed.data.error.code !== "ok" && parsed.data.error.code !== 0) {
    throw new Error(
      parsed.data.error.message
        ? `TikTok từ chối yêu cầu: ${parsed.data.error.message.slice(0, 300)}`
        : "TikTok không trả về thông tin tài khoản.",
    );
  }
  const user = parsed.data.data.user;
  return {
    openId: user.open_id,
    username: user.username ?? null,
    displayName: user.display_name ?? null,
    profileUrl: user.profile_deep_link ?? null,
    followerCount: user.follower_count,
    likesCount: user.likes_count,
  };
}

export async function revokeTikTokAccessToken(
  accessToken: string,
  fetchImplementation: typeof fetch = fetch,
) {
  const { clientKey, clientSecret } = getTikTokConfig();
  const response = await fetchImplementation(`${TIKTOK_API_ORIGIN}/v2/oauth/revoke/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      token: accessToken,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`TikTok API trả về HTTP ${response.status} khi thu hồi quyền.`);
  }
}
