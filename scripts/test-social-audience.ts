import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  fetchYouTubeAudience,
  parseYouTubeChannelReference,
} from "../src/server/social/youtube-audience.provider";
import {
  createTikTokAuthorizationUrl,
  exchangeTikTokAuthorizationCode,
  fetchTikTokAudience,
} from "../src/server/social/tiktok-audience.provider";
import {
  decryptSocialToken,
  encryptSocialToken,
} from "../src/server/social/social-token-crypto";
import { prepareYouTubeAudienceForMutation } from "../src/server/services/social-links.service";
import {
  getSocialAudienceConfig,
  SOCIAL_DESCRIPTION_MAX_LENGTH,
  TIKTOK_AUTOMATION_ENABLED,
} from "../src/utils/social-audience";

assert.deepEqual(
  parseYouTubeChannelReference("https://www.youtube.com/@quangofficial"),
  { kind: "handle", value: "@quangofficial" },
);
assert.deepEqual(
  parseYouTubeChannelReference("https://youtube.com/channel/UC123"),
  { kind: "id", value: "UC123" },
);
assert.throws(
  () => parseYouTubeChannelReference("https://youtu.be/video"),
  /youtube\.com/,
);

assert.equal(getSocialAudienceConfig("youtube").editable, false);
assert.equal(getSocialAudienceConfig("discord").label, "Thành viên máy chủ");
assert.equal(getSocialAudienceConfig("email").label, null);
assert.equal(getSocialAudienceConfig("website").editable, false);
assert.equal(SOCIAL_DESCRIPTION_MAX_LENGTH, 5000);
assert.equal(TIKTOK_AUTOMATION_ENABLED, false);
const encryptionKey = Buffer.alloc(32, 7).toString("base64");
const encryptedToken = encryptSocialToken("secret-token", encryptionKey);
assert.notEqual(encryptedToken, "secret-token");
assert.equal(decryptSocialToken(encryptedToken, encryptionKey), "secret-token");
assert.throws(
  () => decryptSocialToken(`${encryptedToken.slice(0, -1)}x`, encryptionKey),
  /authenticate|không hợp lệ/i,
);
const vercelConfig = JSON.parse(readFileSync("vercel.json", "utf8")) as {
  crons?: Array<{ path?: string; schedule?: string }>;
};
assert.deepEqual(vercelConfig.crons, [{
  path: "/api/cron/social-audience-sync",
  schedule: "0 0 * * *",
}]);

async function main() {
  const previousApiKey = process.env.YOUTUBE_DATA_API_KEY;
  const previousTikTokClientKey = process.env.TIKTOK_CLIENT_KEY;
  const previousTikTokClientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const previousTikTokRedirectUri = process.env.TIKTOK_REDIRECT_URI;
  process.env.YOUTUBE_DATA_API_KEY = "test-key";
  process.env.TIKTOK_CLIENT_KEY = "test-client-key";
  process.env.TIKTOK_CLIENT_SECRET = "test-client-secret";
  process.env.TIKTOK_REDIRECT_URI = "https://example.com/api/auth/tiktok/callback";
  let requestedUrl = "";
  try {
    const result = await fetchYouTubeAudience(
      "https://youtube.com/@quangofficial",
      null,
      (async (input) => {
        requestedUrl = String(input);
        return new Response(JSON.stringify({
          items: [{
            id: "UC_TEST",
            statistics: {
              hiddenSubscriberCount: false,
              subscriberCount: "123456",
            },
          }],
        }), { status: 200 });
      }) as typeof fetch,
    );
    assert.equal(result.channelId, "UC_TEST");
    assert.equal(result.subscriberCount, 123456);
    assert.match(requestedUrl, /forHandle=%40quangofficial/);

    const prepared = await prepareYouTubeAudienceForMutation(
      "https://youtube.com/@quangofficial",
      async () => ({
        channelId: "UC_INITIAL",
        subscriberCount: 324000,
        hiddenSubscriberCount: false,
      }),
    );
    assert.equal(prepared.externalId, "UC_INITIAL");
    assert.equal(prepared.followerCount, 324000);
    assert.equal(prepared.audienceSyncStatus, "synced");
    assert.ok(prepared.audienceLastSyncedAt instanceof Date);

    await assert.rejects(
      () => prepareYouTubeAudienceForMutation(
        "https://youtube.com/@missing",
        async () => {
          throw new Error("Không tìm thấy kênh.");
        },
      ),
      (error: unknown) => (
        error instanceof Error
        && error.name === "ValidationError"
        && "fieldErrors" in error
        && Array.isArray((error as { fieldErrors?: { url?: unknown } }).fieldErrors?.url)
      ),
    );

    const authorizationUrl = new URL(createTikTokAuthorizationUrl("test-state"));
    assert.equal(authorizationUrl.origin, "https://www.tiktok.com");
    assert.equal(authorizationUrl.searchParams.get("state"), "test-state");
    assert.match(authorizationUrl.searchParams.get("scope") ?? "", /user\.info\.stats/);

    const tokenBundle = await exchangeTikTokAuthorizationCode(
      "authorization-code",
      (async (_input, init) => {
        assert.match(String(init?.body), /grant_type=authorization_code/);
        return new Response(JSON.stringify({
          access_token: "access-token",
          expires_in: 86400,
          open_id: "open-id",
          refresh_expires_in: 31536000,
          refresh_token: "refresh-token",
          scope: "user.info.basic,user.info.profile,user.info.stats",
          token_type: "Bearer",
        }), { status: 200 });
      }) as typeof fetch,
    );
    assert.equal(tokenBundle.openId, "open-id");
    assert.equal(tokenBundle.accessToken, "access-token");

    const tiktokAudience = await fetchTikTokAudience(
      tokenBundle.accessToken,
      (async (input, init) => {
        assert.match(String(input), /follower_count/);
        assert.equal(
          (init?.headers as Record<string, string>).Authorization,
          "Bearer access-token",
        );
        return new Response(JSON.stringify({
          data: {
            user: {
              open_id: "open-id",
              username: "quangofficial",
              display_name: "Quang Official",
              profile_deep_link: "https://www.tiktok.com/@quangofficial",
              follower_count: 456000,
              likes_count: 7800000,
            },
          },
          error: { code: "ok", message: "", log_id: "test-log" },
        }), { status: 200 });
      }) as typeof fetch,
    );
    assert.equal(tiktokAudience.followerCount, 456000);
    assert.equal(tiktokAudience.likesCount, 7800000);
  } finally {
    if (previousApiKey === undefined) delete process.env.YOUTUBE_DATA_API_KEY;
    else process.env.YOUTUBE_DATA_API_KEY = previousApiKey;
    if (previousTikTokClientKey === undefined) delete process.env.TIKTOK_CLIENT_KEY;
    else process.env.TIKTOK_CLIENT_KEY = previousTikTokClientKey;
    if (previousTikTokClientSecret === undefined) delete process.env.TIKTOK_CLIENT_SECRET;
    else process.env.TIKTOK_CLIENT_SECRET = previousTikTokClientSecret;
    if (previousTikTokRedirectUri === undefined) delete process.env.TIKTOK_REDIRECT_URI;
    else process.env.TIKTOK_REDIRECT_URI = previousTikTokRedirectUri;
  }
  console.log("Social audience tests passed.");
}

void main();
