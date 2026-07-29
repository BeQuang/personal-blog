import "server-only";

import { z } from "zod";

import { socialLinks as mockSocialLinks } from "@/data/social-links";
import { NotFoundError, ValidationError } from "@/server/errors";
import { mapSocialLinkRow } from "@/server/mappers/social-links.mapper";
import type { NewSocialLinkRow } from "@/server/repositories/social-links.repository";
import {
  parseYouTubeChannelReference,
  type YouTubeAudienceResult,
} from "@/server/social/youtube-audience.provider";
import {
  adminListPageSchema,
  parseAdminListQuery,
} from "@/server/validation/admin-list.validation";
import type {
  AdminListPage,
  AdminSocialLinkListQuery,
  SocialLink,
  SocialLinkMutationInput,
} from "@/types";
import {
  getSocialAudienceConfig,
  SOCIAL_DESCRIPTION_MAX_LENGTH,
  TIKTOK_AUTOMATION_ENABLED,
} from "@/utils/social-audience";

import { getContentSource } from "./content-source";
import { executeRepository } from "./service-helpers";

const idSchema = z.uuid("ID không hợp lệ");
const adminSocialLinkListQuerySchema = adminListPageSchema.extend({
  query: z.string().trim().max(200).default(""),
  platform: z
    .enum(["all", "facebook", "youtube", "tiktok", "instagram", "x", "threads", "zalo", "telegram", "discord", "website", "email"])
    .default("all"),
  sortBy: z
    .enum(["createdAt", "enabled", "followerCount", "label", "sortOrder", "updatedAt"])
    .default("sortOrder"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
const socialLinkSchema = z
  .object({
    platform: z.enum(["facebook", "youtube", "tiktok", "instagram", "x", "threads", "zalo", "telegram", "discord", "website", "email"]),
    label: z.string().trim().min(1, "Tên hiển thị là bắt buộc").max(80),
    username: z.string().trim().max(120).nullable().optional().transform((value) => value || null),
    url: z.string().trim().min(1, "URL là bắt buộc"),
    followerCount: z.number().int().nonnegative().nullable().optional(),
    likesCount: z.number().int().nonnegative().nullable().optional(),
    description: z
      .string()
      .trim()
      .max(
        SOCIAL_DESCRIPTION_MAX_LENGTH,
        `Mô tả không được vượt quá ${SOCIAL_DESCRIPTION_MAX_LENGTH.toLocaleString("vi-VN")} ký tự`,
      )
      .nullable()
      .optional()
      .transform((value) => value || null),
    enabled: z.boolean(),
    order: z.number().int().nonnegative().max(10000),
  })
  .superRefine((value, context) => {
    if (value.platform === "email") {
      if (!/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value.url)) {
        context.addIssue({ code: "custom", path: ["url"], message: "Kênh email phải dùng URL mailto hợp lệ" });
      }
      return;
    }

    try {
      const url = new URL(value.url);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Unsupported protocol");
      }
    } catch {
      context.addIssue({ code: "custom", path: ["url"], message: "URL phải dùng http hoặc https" });
      return;
    }

    if (value.platform === "youtube") {
      try {
        parseYouTubeChannelReference(value.url);
      } catch (error) {
        context.addIssue({
          code: "custom",
          path: ["url"],
          message: error instanceof Error ? error.message : "URL kênh YouTube không hợp lệ",
        });
      }
    }
  });

export async function getSocialLinks(): Promise<SocialLink[]> {
  if (getContentSource() === "mock") {
    return mockSocialLinks.map((link) => ({ ...link })).sort((a, b) => a.order - b.order);
  }
  const { findSocialLinks } = await import("@/server/repositories/social-links.repository");
  return executeRepository(async () => (await findSocialLinks()).map(mapSocialLinkRow));
}

export async function getEnabledSocialLinks(): Promise<SocialLink[]> {
  if (getContentSource() === "mock") {
    return mockSocialLinks
      .filter((link) => link.enabled)
      .map((link) => ({ ...link }))
      .sort((a, b) => a.order - b.order);
  }
  const { findEnabledSocialLinks } = await import("@/server/repositories/social-links.repository");
  return executeRepository(async () => (await findEnabledSocialLinks()).map(mapSocialLinkRow));
}

export async function getAdminSocialLinks() {
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission("settings:manage");
  const { findSocialLinks } = await import("@/server/repositories/social-links.repository");
  return executeRepository(async () => (await findSocialLinks()).map(mapSocialLinkRow));
}

export async function getAdminSocialLinkPage(
  input: unknown,
): Promise<AdminListPage<SocialLink, AdminSocialLinkListQuery["sortBy"]>> {
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission("settings:manage");
  const query = parseAdminListQuery(
    adminSocialLinkListQuerySchema,
    input,
    "Bộ lọc mạng xã hội chưa hợp lệ",
  ) as AdminSocialLinkListQuery;
  const repository = await import("@/server/repositories/social-links.repository");
  const result = await executeRepository(() => repository.findSocialLinkPage(query));
  return {
    items: result.items.map(mapSocialLinkRow),
    total: result.total,
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };
}

async function parseMutation(input: SocialLinkMutationInput) {
  const { requireServicePermission } = await import("./service-authorization");
  const currentUser = await requireServicePermission("settings:manage");
  const parsed = socialLinkSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Dữ liệu social link chưa hợp lệ", parsed.error.flatten().fieldErrors);
  }
  const audienceConfig = getSocialAudienceConfig(parsed.data.platform);
  const audienceValues = parsed.data.platform === "youtube"
    ? {
        followerCount: null,
        likesCount: null,
        externalId: null,
        audienceSource: "youtube_api" as const,
        audienceSyncStatus: "pending" as const,
        audienceLastSyncedAt: null,
        audienceSyncError: null,
      }
    : !audienceConfig.editable
      ? {
          followerCount: null,
          likesCount: null,
          externalId: null,
          audienceSource: "none" as const,
          audienceSyncStatus: "unavailable" as const,
          audienceLastSyncedAt: null,
          audienceSyncError: null,
        }
      : {
          followerCount: parsed.data.followerCount ?? null,
          likesCount: parsed.data.platform === "tiktok"
            ? parsed.data.likesCount ?? null
            : null,
          externalId: null,
          audienceSource: "manual" as const,
          audienceSyncStatus: "manual" as const,
          audienceLastSyncedAt: null,
          audienceSyncError: null,
        };
  return {
    currentUser,
    values: {
      platform: parsed.data.platform,
      label: parsed.data.label,
      username: parsed.data.username,
      url: parsed.data.url,
      ...audienceValues,
      description: parsed.data.description,
      enabled: parsed.data.enabled,
      sortOrder: parsed.data.order,
    },
  };
}

type YouTubeAudienceFetcher = (url: string) => Promise<YouTubeAudienceResult>;

export async function prepareYouTubeAudienceForMutation(
  url: string,
  fetcher?: YouTubeAudienceFetcher,
) {
  const fetchAudience = fetcher
    ?? (await import("@/server/social/youtube-audience.provider")).fetchYouTubeAudience;
  try {
    const result = await fetchAudience(url);
    const unavailable = result.hiddenSubscriberCount || result.subscriberCount === null;
    return {
      followerCount: result.subscriberCount,
      externalId: result.channelId,
      audienceSource: "youtube_api" as const,
      audienceSyncStatus: unavailable ? "unavailable" as const : "synced" as const,
      audienceLastSyncedAt: new Date(),
      audienceSyncError: unavailable
        ? "Kênh đang ẩn số người đăng ký trên YouTube."
        : null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể đồng bộ YouTube.";
    throw new ValidationError(
      "Không thể xác minh kênh YouTube",
      { url: [message] },
    );
  }
}

export async function createSocialLink(input: SocialLinkMutationInput) {
  const prepared = await parseMutation(input);
  const repository = await import("@/server/repositories/social-links.repository");
  const values: NewSocialLinkRow = { ...prepared.values };
  if (values.platform === "youtube") {
    Object.assign(values, await prepareYouTubeAudienceForMutation(values.url));
  }
  const row = await executeRepository(() => repository.createSocialLink(
    values,
    prepared.currentUser.id,
  ));
  return { id: row.id };
}

export async function updateSocialLink(id: string, input: SocialLinkMutationInput) {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) throw new ValidationError("ID social link không hợp lệ", { id: ["ID không hợp lệ"] });
  const prepared = await parseMutation(input);
  const repository = await import("@/server/repositories/social-links.repository");
  const existing = await executeRepository(() => repository.findSocialLinkById(parsedId.data));
  if (!existing) throw new NotFoundError("SocialLink", id);
  const values: NewSocialLinkRow = { ...prepared.values };
  if (
    existing.platform === "youtube"
    && values.platform === "youtube"
    && existing.url === values.url
    && (existing.audienceSyncStatus === "synced"
      || existing.audienceSyncStatus === "unavailable")
  ) {
    values.followerCount = existing.followerCount;
    values.likesCount = null;
    values.externalId = existing.externalId;
    values.audienceSyncStatus = existing.audienceSyncStatus;
    values.audienceLastSyncedAt = existing.audienceLastSyncedAt;
    values.audienceSyncError = existing.audienceSyncError;
  } else if (values.platform === "youtube") {
    Object.assign(values, await prepareYouTubeAudienceForMutation(values.url));
  } else if (
    TIKTOK_AUTOMATION_ENABLED
    &&
    existing.platform === "tiktok"
    && values.platform === "tiktok"
    && existing.audienceSource === "tiktok_api"
  ) {
    values.url = existing.url;
    values.username = existing.username;
    values.followerCount = existing.followerCount;
    values.likesCount = existing.likesCount;
    values.externalId = existing.externalId;
    values.audienceSource = existing.audienceSource;
    values.audienceSyncStatus = existing.audienceSyncStatus;
    values.audienceLastSyncedAt = existing.audienceLastSyncedAt;
    values.audienceSyncError = existing.audienceSyncError;
  }
  const row = await executeRepository(() => repository.updateSocialLink(
    parsedId.data,
    values,
    prepared.currentUser.id,
  ));
  if (!row) throw new NotFoundError("SocialLink", id);
  return { id: row.id };
}

export async function deleteSocialLink(id: string) {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) throw new ValidationError("ID social link không hợp lệ", { id: ["ID không hợp lệ"] });
  const { requireServicePermission } = await import("./service-authorization");
  const currentUser = await requireServicePermission("settings:manage");
  const repository = await import("@/server/repositories/social-links.repository");
  const row = await executeRepository(() => repository.deleteSocialLink(parsedId.data, currentUser.id));
  if (!row) throw new NotFoundError("SocialLink", id);
  return { id: row.id };
}

export async function setSocialLinkEnabled(id: string, enabled: boolean) {
  const parsed = z.object({ id: idSchema, enabled: z.boolean() }).safeParse({ id, enabled });
  if (!parsed.success) throw new ValidationError("Dữ liệu trạng thái chưa hợp lệ", parsed.error.flatten().fieldErrors);
  const { requireServicePermission } = await import("./service-authorization");
  const currentUser = await requireServicePermission("settings:manage");
  const repository = await import("@/server/repositories/social-links.repository");
  const row = await executeRepository(() => repository.updateSocialLink(
    parsed.data.id,
    { enabled: parsed.data.enabled },
    currentUser.id,
    "social_link.enabled.update",
  ));
  if (!row) throw new NotFoundError("SocialLink", id);
  return { id: row.id };
}

export async function prepareSocialLinkMutation(input: SocialLinkMutationInput) {
  return parseMutation(input);
}

export async function requireTikTokOAuthAccess() {
  const { requireServicePermission } = await import("./service-authorization");
  const currentUser = await requireServicePermission("settings:manage");
  if (!TIKTOK_AUTOMATION_ENABLED) {
    throw new ValidationError("Tính năng kết nối TikTok đang tạm tắt.");
  }
  return currentUser;
}

export async function prepareTikTokOAuthStart(socialLinkId: string, state: string) {
  const parsedId = idSchema.safeParse(socialLinkId);
  if (!parsedId.success) {
    throw new ValidationError("ID social link không hợp lệ", { id: ["ID không hợp lệ"] });
  }
  await requireTikTokOAuthAccess();
  const repository = await import("@/server/repositories/social-links.repository");
  const link = await executeRepository(() => repository.findSocialLinkById(parsedId.data));
  if (!link) throw new NotFoundError("SocialLink", socialLinkId);
  if (link.platform !== "tiktok") {
    throw new ValidationError("Chỉ social link TikTok mới có thể kết nối TikTok.");
  }
  const { createTikTokAuthorizationUrl } = await import(
    "@/server/social/tiktok-audience.provider"
  );
  return {
    authorizationUrl: createTikTokAuthorizationUrl(state),
    socialLinkId: link.id,
  };
}

export async function connectTikTokSocialLink(
  socialLinkId: string,
  authorizationCode: string,
) {
  const parsed = z.object({
    socialLinkId: idSchema,
    authorizationCode: z.string().trim().min(1),
  }).safeParse({ socialLinkId, authorizationCode });
  if (!parsed.success) {
    throw new ValidationError("Dữ liệu kết nối TikTok không hợp lệ", parsed.error.flatten().fieldErrors);
  }
  const currentUser = await requireTikTokOAuthAccess();
  const repository = await import("@/server/repositories/social-links.repository");
  const link = await executeRepository(() => repository.findSocialLinkById(parsed.data.socialLinkId));
  if (!link) throw new NotFoundError("SocialLink", socialLinkId);
  if (link.platform !== "tiktok") {
    throw new ValidationError("Social link đã chọn không phải TikTok.");
  }

  const provider = await import("@/server/social/tiktok-audience.provider");
  const crypto = await import("@/server/social/social-token-crypto");
  const tokens = await provider.exchangeTikTokAuthorizationCode(parsed.data.authorizationCode);
  const profile = await provider.fetchTikTokAudience(tokens.accessToken);
  if (tokens.openId !== profile.openId) {
    throw new ValidationError("Tài khoản TikTok trả về không khớp với phiên cấp quyền.");
  }

  const row = await executeRepository(() => repository.connectTikTokSocialLink(
    link.id,
    {
      connection: {
        providerUserId: profile.openId,
        accessTokenCiphertext: crypto.encryptSocialToken(tokens.accessToken),
        refreshTokenCiphertext: crypto.encryptSocialToken(tokens.refreshToken),
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
        scopes: tokens.scopes,
      },
      link: {
        username: profile.username
          ? `@${profile.username.replace(/^@/, "")}`
          : link.username,
        url: profile.profileUrl ?? link.url,
        followerCount: profile.followerCount,
        likesCount: profile.likesCount,
        externalId: profile.openId,
        audienceSource: "tiktok_api",
        audienceSyncStatus: "synced",
        audienceLastSyncedAt: new Date(),
        audienceSyncError: null,
      },
    },
    currentUser.id,
  ));
  if (!row) throw new NotFoundError("SocialLink", socialLinkId);
  return { id: row.id };
}

export async function disconnectTikTokSocialLink(socialLinkId: string) {
  const parsedId = idSchema.safeParse(socialLinkId);
  if (!parsedId.success) {
    throw new ValidationError("ID social link không hợp lệ", { id: ["ID không hợp lệ"] });
  }
  const { requireServicePermission } = await import("./service-authorization");
  const currentUser = await requireServicePermission("settings:manage");
  const repository = await import("@/server/repositories/social-links.repository");
  const connection = await executeRepository(
    () => repository.findSocialOauthConnectionByLinkId(parsedId.data),
  );
  if (connection?.provider === "tiktok") {
    try {
      const { decryptSocialToken } = await import("@/server/social/social-token-crypto");
      const { revokeTikTokAccessToken } = await import(
        "@/server/social/tiktok-audience.provider"
      );
      await revokeTikTokAccessToken(decryptSocialToken(connection.accessTokenCiphertext));
    } catch {
      // Local disconnect must remain available when the provider or old token is unavailable.
    }
  }
  const row = await executeRepository(
    () => repository.disconnectTikTokSocialLink(parsedId.data, currentUser.id),
  );
  if (!row) throw new NotFoundError("SocialLink", socialLinkId);
  return { id: row.id };
}

export interface SocialAudienceSyncSummary {
  total: number;
  synced: number;
  unavailable: number;
  failed: number;
}

export async function syncYouTubeSocialLinkAudience(): Promise<SocialAudienceSyncSummary> {
  const repository = await import("@/server/repositories/social-links.repository");
  const { fetchYouTubeAudience } = await import("@/server/social/youtube-audience.provider");
  const links = await executeRepository(() => repository.findYouTubeSocialLinksForSync());
  const summary: SocialAudienceSyncSummary = {
    total: links.length,
    synced: 0,
    unavailable: 0,
    failed: 0,
  };

  for (const link of links) {
    try {
      const result = await fetchYouTubeAudience(link.url, link.externalId);
      const unavailable = result.hiddenSubscriberCount || result.subscriberCount === null;
      await executeRepository(() => repository.updateSocialLinkAudienceSync(link.id, {
        externalId: result.channelId,
        followerCount: result.subscriberCount,
        audienceSyncStatus: unavailable ? "unavailable" : "synced",
        audienceSyncError: unavailable
          ? "Kênh đang ẩn số người đăng ký trên YouTube."
          : null,
        audienceLastSyncedAt: new Date(),
      }));
      if (unavailable) summary.unavailable += 1;
      else summary.synced += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể đồng bộ YouTube.";
      await executeRepository(() => repository.updateSocialLinkAudienceSync(link.id, {
        audienceSyncStatus: "error",
        audienceSyncError: message.slice(0, 500),
      }));
      summary.failed += 1;
    }
  }
  return summary;
}

export async function syncTikTokSocialLinkAudience(): Promise<SocialAudienceSyncSummary> {
  if (!TIKTOK_AUTOMATION_ENABLED) {
    return {
      total: 0,
      synced: 0,
      unavailable: 0,
      failed: 0,
    };
  }
  const repository = await import("@/server/repositories/social-links.repository");
  const provider = await import("@/server/social/tiktok-audience.provider");
  const crypto = await import("@/server/social/social-token-crypto");
  const records = await executeRepository(() => repository.findTikTokSocialLinksForSync());
  const summary: SocialAudienceSyncSummary = {
    total: records.length,
    synced: 0,
    unavailable: 0,
    failed: 0,
  };

  for (const { link, connection } of records) {
    try {
      let accessToken = crypto.decryptSocialToken(connection.accessTokenCiphertext);
      if (connection.accessTokenExpiresAt.getTime() <= Date.now() + 5 * 60 * 1000) {
        if (connection.refreshTokenExpiresAt.getTime() <= Date.now()) {
          throw new Error("Quyền TikTok đã hết hạn; hãy kết nối lại tài khoản.");
        }
        const refreshToken = crypto.decryptSocialToken(connection.refreshTokenCiphertext);
        const refreshed = await provider.refreshTikTokAccessToken(refreshToken);
        if (refreshed.openId !== connection.providerUserId) {
          throw new Error("Tài khoản TikTok sau khi làm mới token không khớp.");
        }
        accessToken = refreshed.accessToken;
        await executeRepository(() => repository.updateSocialOauthConnectionTokens(
          connection.id,
          {
            providerUserId: refreshed.openId,
            accessTokenCiphertext: crypto.encryptSocialToken(refreshed.accessToken),
            refreshTokenCiphertext: crypto.encryptSocialToken(refreshed.refreshToken),
            accessTokenExpiresAt: refreshed.accessTokenExpiresAt,
            refreshTokenExpiresAt: refreshed.refreshTokenExpiresAt,
            scopes: refreshed.scopes,
          },
        ));
      }

      const profile = await provider.fetchTikTokAudience(accessToken);
      if (profile.openId !== connection.providerUserId) {
        throw new Error("Dữ liệu TikTok trả về không khớp tài khoản đã kết nối.");
      }
      await executeRepository(() => repository.updateSocialLinkAudienceSync(link.id, {
        externalId: profile.openId,
        followerCount: profile.followerCount,
        likesCount: profile.likesCount,
        audienceSyncStatus: "synced",
        audienceSyncError: null,
        audienceLastSyncedAt: new Date(),
      }));
      summary.synced += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể đồng bộ TikTok.";
      await executeRepository(() => repository.updateSocialLinkAudienceSync(link.id, {
        audienceSyncStatus: "error",
        audienceSyncError: message.slice(0, 500),
      }));
      summary.failed += 1;
    }
  }
  return summary;
}

export async function syncSocialLinkAudience() {
  const youtube = await syncYouTubeSocialLinkAudience();
  const tiktok = await syncTikTokSocialLinkAudience();
  return {
    total: youtube.total + tiktok.total,
    synced: youtube.synced + tiktok.synced,
    unavailable: youtube.unavailable + tiktok.unavailable,
    failed: youtube.failed + tiktok.failed,
    youtube,
    tiktok,
  };
}
