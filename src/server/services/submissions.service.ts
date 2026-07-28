import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { z } from "zod";

import { budgetRanges, collaborationTypes } from "@/config/contact.config";
import { siteConfig } from "@/config/site.config";
import {
  ConflictError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "@/server/errors";
import {
  mapAdminCampaignSubmissionRow,
  mapContactSubmissionRow,
  mapNewsletterSubscriptionRow,
} from "@/server/mappers/submissions.mapper";
import type { PublicRequestContext } from "@/server/anti-spam/request-context";
import { verifyTurnstileToken, type TurnstileAction } from "@/server/anti-spam/turnstile";
import { getEmailProvider } from "@/server/email/resend-provider";
import { getRateLimiter } from "@/server/rate-limit/upstash-rate-limiter";
import { recordServerAnalyticsEventSafely } from "@/server/services/analytics.service";
import type { RateLimitPolicy } from "@/server/rate-limit/rate-limiter";
import type {
  AdminCampaignSubmission,
  AdminContactSubmission,
  AdminNewsletterSubscription,
  AdminSubmissionPage,
  CampaignSubmissionInput,
  ContactSubmissionInput,
  NewsletterSubscriptionInput,
  NewsletterStatus,
  SubmissionResource,
  SubmissionStatus,
} from "@/types";

import { executeRepository, slugSchema } from "./service-helpers";

const turnstileTokenSchema = z.string().trim().min(10).max(4_096);
const normalizedEmailSchema = z.string().trim().toLowerCase().pipe(z.email());
const optionalText = (maximum: number) =>
  z.string().trim().max(maximum).transform((value) => value || undefined);
const optionalPhoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s.-]/g, ""))
  .refine((value) => !value || /^(?:\+84|0)\d{9,10}$/.test(value), {
    message: "Số điện thoại chưa đúng định dạng.",
  })
  .transform((value) => value || undefined);

const contactInputSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: normalizedEmailSchema,
  phone: optionalPhoneSchema,
  company: optionalText(160),
  collaborationType: z.enum(collaborationTypes),
  budgetRange: z
    .union([z.literal(""), z.enum(budgetRanges)])
    .transform((value) => value || undefined),
  message: z.string().trim().min(20).max(2_000),
  turnstileToken: turnstileTokenSchema,
});

const newsletterInputSchema = z.object({
  email: normalizedEmailSchema,
  turnstileToken: turnstileTokenSchema,
});

const campaignInputSchema = z.object({
  campaignSlug: slugSchema,
  fullName: z.string().trim().min(2).max(120),
  email: normalizedEmailSchema,
  phone: optionalPhoneSchema.refine((value) => Boolean(value), {
    message: "Vui lòng nhập số điện thoại.",
  }),
  followedPlatform: z.enum(["youtube", "tiktok", "instagram", "facebook"]),
  socialUsername: z.string().trim().min(2).max(120),
  notes: optionalText(1_000),
  turnstileToken: turnstileTokenSchema,
});

export const contactSubmissionStatuses = [
  "new",
  "read",
  "replied",
  "spam",
  "archived",
] as const satisfies readonly SubmissionStatus[];
export const campaignSubmissionStatuses = [
  "new",
  "reviewing",
  "accepted",
  "rejected",
  "spam",
  "archived",
] as const satisfies readonly SubmissionStatus[];
export const newsletterSubscriptionStatuses = [
  "subscribed",
  "unsubscribed",
  "suppressed",
] as const satisfies readonly NewsletterStatus[];

const newsletterStatusSchema = z.enum(newsletterSubscriptionStatuses);
const submissionResourceSchema = z.enum(["contact", "newsletter", "campaign"]);
const idSchema = z.uuid();
const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  query: z.string().trim().max(200).optional(),
  status: z.string().trim().max(30).optional(),
  campaignId: z.string().trim().optional(),
});

function validateInput<T>(schema: z.ZodType<T>, input: unknown, message: string) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(message, parsed.error.flatten().fieldErrors);
  }
  return parsed.data;
}

async function assertPublicSubmissionAllowed(
  namespace: string,
  action: TurnstileAction,
  token: string,
  requestContext: PublicRequestContext,
  policy: RateLimitPolicy,
) {
  const rateLimit = await getRateLimiter().check(
    namespace,
    requestContext.fingerprint,
    policy,
  );
  if (!rateLimit.success) {
    throw new RateLimitError(
      Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1_000)),
      "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.",
    );
  }

  const verification = await verifyTurnstileToken(
    token,
    action,
    requestContext.ipAddress,
  );
  if (!verification.success) {
    throw new ValidationError("Không thể xác minh yêu cầu chống spam.", {
      turnstileToken: ["Vui lòng thực hiện lại bước xác minh chống spam."],
    });
  }
}

function createUnsubscribeToken() {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: createHash("sha256").update(token).digest("hex"),
  };
}

export async function submitContact(
  input: ContactSubmissionInput,
  requestContext: PublicRequestContext,
) {
  const parsed = validateInput(
    contactInputSchema,
    input,
    "Thông tin liên hệ chưa hợp lệ.",
  );
  await assertPublicSubmissionAllowed(
    "contact",
    "contact",
    parsed.turnstileToken,
    requestContext,
    { limit: 5, window: "15 m" },
  );

  const repository = await import("@/server/repositories/submissions.repository");
  const row = await executeRepository(() =>
    repository.createContactSubmission({
      fullName: parsed.fullName,
      email: parsed.email,
      emailNormalized: parsed.email,
      phone: parsed.phone,
      company: parsed.company,
      collaborationType: parsed.collaborationType,
      budgetRange: parsed.budgetRange,
      message: parsed.message,
      source: "website-contact",
    }),
  );

  await recordServerAnalyticsEventSafely({
    eventType: "contact_submit",
    path: "/contact",
  });

  try {
    await getEmailProvider().sendContactNotification({
      submissionId: row.id,
      fullName: row.fullName,
      email: row.email,
      ...(row.phone ? { phone: row.phone } : {}),
      ...(row.company ? { company: row.company } : {}),
      collaborationType: row.collaborationType,
      ...(row.budgetRange ? { budgetRange: row.budgetRange } : {}),
      message: row.message,
      createdAt: row.createdAt,
    });
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.error("Contact notification delivery failed", {
      submissionId: row.id,
      errorName,
    });
  }

  return { id: row.id };
}

export async function subscribeNewsletter(
  input: NewsletterSubscriptionInput,
  requestContext: PublicRequestContext,
) {
  const parsed = validateInput(
    newsletterInputSchema,
    input,
    "Thông tin đăng ký chưa hợp lệ.",
  );
  await assertPublicSubmissionAllowed(
    "newsletter",
    "newsletter",
    parsed.turnstileToken,
    requestContext,
    { limit: 5, window: "1 h" },
  );

  const { token, tokenHash } = createUnsubscribeToken();
  const repository = await import("@/server/repositories/submissions.repository");
  const row = await executeRepository(() =>
    repository.upsertNewsletterSubscription({
      email: parsed.email,
      emailNormalized: parsed.email,
      status: "subscribed",
      source: "homepage-newsletter",
      unsubscribeTokenHash: tokenHash,
    }),
  );

  await recordServerAnalyticsEventSafely({
    eventType: "newsletter_submit",
    path: "/",
  });

  if (row.status !== "suppressed") {
    try {
      const unsubscribeUrl = new URL("/newsletter/unsubscribe", siteConfig.siteUrl);
      unsubscribeUrl.searchParams.set("token", token);
      await getEmailProvider().sendNewsletterConfirmation({
        email: row.email,
        unsubscribeUrl: unsubscribeUrl.toString(),
      });
    } catch (error) {
      const errorName = error instanceof Error ? error.name : "UnknownError";
      console.error("Newsletter confirmation delivery failed", {
        subscriptionId: row.id,
        errorName,
      });
    }
  }
}

export async function unsubscribeNewsletter(token: string) {
  const parsedToken = validateInput(
    z.string().trim().min(32).max(256),
    token,
    "Liên kết hủy đăng ký chưa hợp lệ.",
  );
  const tokenHash = createHash("sha256").update(parsedToken).digest("hex");
  const repository = await import("@/server/repositories/submissions.repository");
  await executeRepository(() => repository.unsubscribeNewsletterByTokenHash(tokenHash));
}

export async function submitCampaign(
  input: CampaignSubmissionInput,
  requestContext: PublicRequestContext,
) {
  const parsed = validateInput(
    campaignInputSchema,
    input,
    "Thông tin tham gia chưa hợp lệ.",
  );
  await assertPublicSubmissionAllowed(
    `campaign:${parsed.campaignSlug}`,
    "campaign_submission",
    parsed.turnstileToken,
    requestContext,
    { limit: 5, window: "1 h" },
  );

  const repository = await import("@/server/repositories/submissions.repository");
  try {
    const row = await executeRepository(() =>
      repository.withCampaignSubmissionLock(
        parsed.campaignSlug,
        async ({ campaign, submissionCount, insert }) => {
          const now = new Date();
          if (
            !campaign
            || campaign.status !== "active"
            || campaign.startAt > now
            || campaign.endAt <= now
            || !campaign.submissionEnabled
          ) {
            throw new ValidationError("Chiến dịch hiện không nhận đăng ký.");
          }
          if (campaign.submissionLimit && submissionCount >= campaign.submissionLimit) {
            throw new ValidationError("Chiến dịch đã đạt giới hạn đăng ký.");
          }

          return insert({
            campaignId: campaign.id,
            fullName: parsed.fullName,
            email: parsed.email,
            emailNormalized: parsed.email,
            phone: parsed.phone,
            followedPlatform: parsed.followedPlatform,
            socialUsername: parsed.socialUsername,
            notes: parsed.notes,
            source: "campaign-page",
          });
        },
      ),
    );
    if (row) {
      await recordServerAnalyticsEventSafely({
        eventType: "campaign_submit",
        entityType: "campaign",
        entityId: row.campaignId,
        path: `/campaigns/${parsed.campaignSlug}`,
      });
    }
    return { id: row.id, created: true };
  } catch (error) {
    if (error instanceof ConflictError) {
      return { created: false };
    }
    throw error;
  }
}

async function requireSubmissionPermission(
  permission: "submissions:view" | "submissions:manage" | "submissions:export",
) {
  const { requireServicePermission } = await import("./service-authorization");
  return requireServicePermission(permission);
}

function parseAdminQuery(input: unknown) {
  return validateInput(adminListQuerySchema, input, "Bộ lọc chưa hợp lệ.");
}

export async function getContactSubmissionPage(
  input: unknown,
): Promise<AdminSubmissionPage<AdminContactSubmission>> {
  await requireSubmissionPermission("submissions:view");
  const parsed = parseAdminQuery(input);
  const status = parsed.status
    ? validateInput(z.enum(contactSubmissionStatuses), parsed.status, "Trạng thái chưa hợp lệ.")
    : undefined;
  const repository = await import("@/server/repositories/submissions.repository");
  const page = await executeRepository(() =>
    repository.findContactSubmissionPage({ ...parsed, status }),
  );
  return { ...page, items: page.items.map(mapContactSubmissionRow) };
}

export async function getNewsletterSubscriptionPage(
  input: unknown,
): Promise<AdminSubmissionPage<AdminNewsletterSubscription>> {
  await requireSubmissionPermission("submissions:view");
  const parsed = parseAdminQuery(input);
  const status = parsed.status
    ? validateInput(newsletterStatusSchema, parsed.status, "Trạng thái chưa hợp lệ.")
    : undefined;
  const repository = await import("@/server/repositories/submissions.repository");
  const page = await executeRepository(() =>
    repository.findNewsletterSubscriptionPage({ ...parsed, status }),
  );
  return { ...page, items: page.items.map(mapNewsletterSubscriptionRow) };
}

export async function getCampaignSubmissionPage(
  input: unknown,
): Promise<AdminSubmissionPage<AdminCampaignSubmission>> {
  await requireSubmissionPermission("submissions:view");
  const parsed = parseAdminQuery(input);
  const status = parsed.status
    ? validateInput(z.enum(campaignSubmissionStatuses), parsed.status, "Trạng thái chưa hợp lệ.")
    : undefined;
  const campaignId = parsed.campaignId
    ? validateInput(idSchema, parsed.campaignId, "Chiến dịch chưa hợp lệ.")
    : undefined;
  const repository = await import("@/server/repositories/submissions.repository");
  const page = await executeRepository(() =>
    repository.findCampaignSubmissionPage({ ...parsed, status, campaignId }),
  );
  return { ...page, items: page.items.map(mapAdminCampaignSubmissionRow) };
}

export async function getSubmissionCampaignOptions() {
  await requireSubmissionPermission("submissions:view");
  const repository = await import("@/server/repositories/submissions.repository");
  return executeRepository(() => repository.findSubmissionCampaignOptions());
}

export async function updateSubmissionStatus(
  resource: SubmissionResource,
  id: string,
  status: string,
) {
  const currentUser = await requireSubmissionPermission("submissions:manage");
  const parsedResource = validateInput(
    submissionResourceSchema,
    resource,
    "Loại submission chưa hợp lệ.",
  );
  const parsedId = validateInput(idSchema, id, "Submission ID chưa hợp lệ.");
  const repository = await import("@/server/repositories/submissions.repository");
  let row;

  if (parsedResource === "contact") {
    const parsedStatus = validateInput(
      z.enum(contactSubmissionStatuses),
      status,
      "Trạng thái chưa hợp lệ.",
    );
    row = await executeRepository(() =>
      repository.updateContactSubmissionStatus(parsedId, parsedStatus, currentUser.id),
    );
  } else if (parsedResource === "campaign") {
    const parsedStatus = validateInput(
      z.enum(campaignSubmissionStatuses),
      status,
      "Trạng thái chưa hợp lệ.",
    );
    row = await executeRepository(() =>
      repository.updateCampaignSubmissionStatus(parsedId, parsedStatus, currentUser.id),
    );
  } else {
    const parsedStatus = validateInput(
      newsletterStatusSchema,
      status,
      "Trạng thái chưa hợp lệ.",
    );
    row = await executeRepository(() =>
      repository.updateNewsletterSubscriptionStatus(parsedId, parsedStatus, currentUser.id),
    );
  }

  if (!row) throw new NotFoundError("Submission", parsedId);
  return row;
}

export async function requireSubmissionExportPermission() {
  return requireSubmissionPermission("submissions:export");
}

const exportQuerySchema = z.object({
  resource: z.enum(["contact", "newsletter", "campaign"]),
  query: z.string().trim().max(200).optional(),
  status: z.string().trim().max(30).optional(),
  campaignId: z.string().trim().optional(),
});

export async function getSubmissionExportData(input: unknown) {
  await requireSubmissionPermission("submissions:export");
  const parsed = validateInput(exportQuerySchema, input, "Bộ lọc export chưa hợp lệ.");
  const repository = await import("@/server/repositories/submissions.repository");
  const baseQuery = {
    page: 1,
    pageSize: 5_000,
    query: parsed.query,
  };

  if (parsed.resource === "contact") {
    const status = parsed.status
      ? validateInput(z.enum(contactSubmissionStatuses), parsed.status, "Trạng thái chưa hợp lệ.")
      : undefined;
    const page = await executeRepository(() =>
      repository.findContactSubmissionPage({ ...baseQuery, status }),
    );
    const items = page.items.map(mapContactSubmissionRow);
    return {
      filename: "contact-submissions.csv",
      headers: [
        "ID",
        "Họ tên",
        "Email",
        "Số điện thoại",
        "Công ty",
        "Loại hợp tác",
        "Ngân sách",
        "Nội dung",
        "Trạng thái",
        "Ngày gửi",
      ],
      rows: items.map((item) => [
        item.id,
        item.fullName,
        item.email,
        item.phone,
        item.company,
        item.collaborationType,
        item.budgetRange,
        item.message,
        item.status,
        item.createdAt,
      ]),
    };
  }

  if (parsed.resource === "newsletter") {
    const status = parsed.status
      ? validateInput(newsletterStatusSchema, parsed.status, "Trạng thái chưa hợp lệ.")
      : undefined;
    const page = await executeRepository(() =>
      repository.findNewsletterSubscriptionPage({ ...baseQuery, status }),
    );
    const items = page.items.map(mapNewsletterSubscriptionRow);
    return {
      filename: "newsletter-subscriptions.csv",
      headers: ["ID", "Email", "Trạng thái", "Ngày đăng ký", "Ngày hủy"],
      rows: items.map((item) => [
        item.id,
        item.email,
        item.status,
        item.subscribedAt,
        item.unsubscribedAt,
      ]),
    };
  }

  const status = parsed.status
    ? validateInput(z.enum(campaignSubmissionStatuses), parsed.status, "Trạng thái chưa hợp lệ.")
    : undefined;
  const campaignId = parsed.campaignId
    ? validateInput(idSchema, parsed.campaignId, "Chiến dịch chưa hợp lệ.")
    : undefined;
  const page = await executeRepository(() =>
    repository.findCampaignSubmissionPage({
      ...baseQuery,
      status,
      campaignId,
    }),
  );
  const items = page.items.map(mapAdminCampaignSubmissionRow);
  return {
    filename: "campaign-submissions.csv",
    headers: [
      "ID",
      "Chiến dịch",
      "Họ tên",
      "Email",
      "Số điện thoại",
      "Nền tảng",
      "Username",
      "Ghi chú",
      "Trạng thái",
      "Ngày gửi",
    ],
    rows: items.map((item) => [
      item.id,
      item.campaignTitle,
      item.fullName,
      item.email,
      item.phone,
      item.followedPlatform,
      item.socialUsername,
      item.notes,
      item.status,
      item.createdAt,
    ]),
  };
}
