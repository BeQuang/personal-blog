import "server-only";

import { createHash } from "node:crypto";

import { z } from "zod";

import {
  clientAnalyticsEventTypes,
} from "@/config/analytics.config";
import type { PublicRequestContext } from "@/server/anti-spam/request-context";
import { ValidationError } from "@/server/errors";
import { getRateLimiter } from "@/server/rate-limit/upstash-rate-limiter";
import type {
  AnalyticsDashboardData,
  AnalyticsDeviceCategory,
  AnalyticsEntityType,
  AnalyticsEventType,
} from "@/types";

import { executeRepository } from "./service-helpers";

const pathSchema = z
  .string()
  .trim()
  .min(1)
  .max(512)
  .startsWith("/")
  .refine((value) => !/[\u0000-\u001f\u007f]/.test(value));
const optionalDimension = z.string().trim().min(1).max(120).optional();
const entityTypeSchema = z.enum(["post", "video", "social", "campaign"]);
const clientEventSchema = z
  .object({
    eventType: z.enum(clientAnalyticsEventTypes),
    entityType: entityTypeSchema.optional(),
    entityId: z.string().trim().min(1).max(160).optional(),
    path: pathSchema,
    referrerDomain: z
      .string()
      .trim()
      .toLowerCase()
      .max(253)
      .regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/)
      .optional(),
    utmSource: optionalDimension,
    utmMedium: optionalDimension,
    utmCampaign: optionalDimension,
    sessionId: z.uuid().optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const expectedEntities: Partial<
      Record<(typeof clientAnalyticsEventTypes)[number], AnalyticsEntityType>
    > = {
      post_view: "post",
      video_view: "video",
      social_click: "social",
      campaign_view: "campaign",
      campaign_click: "campaign",
    };
    const expected = expectedEntities[value.eventType];
    if (expected && (value.entityType !== expected || !value.entityId)) {
      context.addIssue({
        code: "custom",
        path: ["entityType"],
        message: `Event ${value.eventType} yêu cầu entity ${expected}.`,
      });
    }
    if (!expected && (value.entityType || value.entityId)) {
      context.addIssue({
        code: "custom",
        path: ["entityType"],
        message: "Event page_view không nhận entity.",
      });
    }
  });

const serverEventSchema = z
  .object({
    eventType: z.enum(["campaign_submit", "contact_submit", "newsletter_submit"]),
    entityType: entityTypeSchema.optional(),
    entityId: z.string().trim().min(1).max(160).optional(),
    path: pathSchema,
  })
  .strict()
  .superRefine((value, context) => {
    if (
      value.eventType === "campaign_submit"
      && (value.entityType !== "campaign" || !value.entityId)
    ) {
      context.addIssue({
        code: "custom",
        path: ["entityType"],
        message: "campaign_submit yêu cầu campaign entity.",
      });
    }
    if (
      value.eventType !== "campaign_submit"
      && (value.entityType || value.entityId)
    ) {
      context.addIssue({
        code: "custom",
        path: ["entityType"],
        message: "Submission event này không nhận entity.",
      });
    }
  });

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
});
const dashboardQuerySchema = z
  .object({
    from: dateSchema,
    to: dateSchema,
  })
  .superRefine((value, context) => {
    const from = new Date(`${value.from}T00:00:00.000Z`);
    const to = new Date(`${value.to}T00:00:00.000Z`);
    const days = Math.floor((to.getTime() - from.getTime()) / 86_400_000) + 1;
    if (days < 1 || days > 366) {
      context.addIssue({
        code: "custom",
        path: ["to"],
        message: "Khoảng ngày phải từ 1 đến 366 ngày.",
      });
    }
  });

interface AnalyticsRequestMetadata {
  userAgent?: string;
  countryCode?: string;
  requestHost?: string;
}

function validateInput<T>(schema: z.ZodType<T>, input: unknown, message: string) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(message, parsed.error.flatten().fieldErrors);
  }
  return parsed.data;
}

function getDeviceCategory(userAgent?: string): AnalyticsDeviceCategory {
  if (!userAgent) return "unknown";
  if (/ipad|tablet|kindle|silk/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|ipod|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hashDimensions(dimensions: Record<string, string>) {
  return hashValue(JSON.stringify(Object.entries(dimensions).sort(([left], [right]) =>
    left.localeCompare(right),
  )));
}

function createAggregates(event: {
  eventType: AnalyticsEventType;
  entityType?: string;
  entityId?: string;
  referrerDomain?: string;
  utmCampaign?: string;
  deviceCategory?: AnalyticsDeviceCategory;
  requestHost?: string;
  createdAt: Date;
}) {
  const date = event.createdAt.toISOString().slice(0, 10);
  const baseDimensions: Record<string, string> = {};
  const aggregates: Array<{
    date: string;
    metric: string;
    entityType?: string;
    entityId?: string;
    dimensions: Record<string, string>;
    dimensionsHash: string;
  }> = [
    {
      date,
      metric: event.eventType,
      entityType: event.entityType,
      entityId: event.entityId,
      dimensions: baseDimensions,
      dimensionsHash: hashDimensions(baseDimensions),
    },
  ];

  if (event.eventType === "page_view") {
    const trafficSource = event.referrerDomain
      ? event.referrerDomain === event.requestHost
        ? "internal"
        : event.referrerDomain
      : "direct";
    const sourceDimensions = { source: trafficSource };
    const deviceDimensions = { device: event.deviceCategory ?? "unknown" };
    aggregates.push(
      {
        date,
        metric: "traffic_source",
        dimensions: sourceDimensions,
        dimensionsHash: hashDimensions(sourceDimensions),
      },
      {
        date,
        metric: "device_category",
        dimensions: deviceDimensions,
        dimensionsHash: hashDimensions(deviceDimensions),
      },
    );
    if (event.utmCampaign) {
      const campaignDimensions = { campaign: event.utmCampaign };
      aggregates.push({
        date,
        metric: "utm_campaign",
        dimensions: campaignDimensions,
        dimensionsHash: hashDimensions(campaignDimensions),
      });
    }
  }

  return aggregates;
}

export function isAnalyticsEnabled() {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "false";
}

export async function ingestClientAnalyticsEvent(
  input: unknown,
  requestContext: PublicRequestContext,
  metadata: AnalyticsRequestMetadata,
) {
  if (!isAnalyticsEnabled()) return { accepted: false as const };
  const parsed = validateInput(
    clientEventSchema,
    input,
    "Analytics event chưa hợp lệ.",
  );
  const rateLimit = await getRateLimiter().check(
    "analytics-ingest",
    requestContext.fingerprint,
    { limit: 120, window: "1 m" },
  );
  if (!rateLimit.success) {
    return {
      accepted: false as const,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((rateLimit.resetAt - Date.now()) / 1_000),
      ),
    };
  }

  const createdAt = new Date();
  const deviceCategory = getDeviceCategory(metadata.userAgent);
  const countryCode = metadata.countryCode?.toUpperCase();
  const repository = await import("@/server/repositories/analytics.repository");
  const event = {
    eventType: parsed.eventType,
    entityType: parsed.entityType,
    entityId: parsed.entityId,
    path: parsed.path,
    referrerDomain: parsed.referrerDomain,
    utmSource: parsed.utmSource,
    utmMedium: parsed.utmMedium,
    utmCampaign: parsed.utmCampaign,
    deviceCategory,
    countryCode,
    anonymousSessionHash: parsed.sessionId
      ? hashValue(parsed.sessionId)
      : undefined,
    metadata: {},
    createdAt,
  };
  await executeRepository(() =>
    repository.insertAnalyticsEvent(
      event,
      createAggregates({
        ...event,
        requestHost: metadata.requestHost,
      }),
    ),
  );
  return { accepted: true as const };
}

export async function recordServerAnalyticsEvent(input: unknown) {
  if (!isAnalyticsEnabled()) return;
  const parsed = validateInput(
    serverEventSchema,
    input,
    "Server analytics event chưa hợp lệ.",
  );
  const createdAt = new Date();
  const repository = await import("@/server/repositories/analytics.repository");
  await executeRepository(() =>
    repository.insertAnalyticsEvent(
      {
        ...parsed,
        metadata: {},
        createdAt,
      },
      createAggregates({ ...parsed, createdAt }),
    ),
  );
}

export async function recordServerAnalyticsEventSafely(input: unknown) {
  try {
    await recordServerAnalyticsEvent(input);
  } catch (error) {
    console.error("Analytics event recording failed", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
  }
}

function createRepositoryRange(from: string, to: string) {
  const startAt = new Date(`${from}T00:00:00.000Z`);
  const endAtExclusive = new Date(`${to}T00:00:00.000Z`);
  endAtExclusive.setUTCDate(endAtExclusive.getUTCDate() + 1);
  return { from, to, startAt, endAtExclusive };
}

function fillDailyPoints(
  from: string,
  to: string,
  rows: readonly { date: string; pageViews: number; contentViews: number }[],
) {
  const byDate = new Map(rows.map((row) => [row.date, row]));
  const cursor = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);
  const result = [];
  while (cursor <= end) {
    const date = cursor.toISOString().slice(0, 10);
    const row = byDate.get(date);
    result.push({
      date,
      pageViews: Number(row?.pageViews ?? 0),
      contentViews: Number(row?.contentViews ?? 0),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}

export async function getAnalyticsDashboard(
  input: unknown,
): Promise<AnalyticsDashboardData> {
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission("analytics:view");
  const parsed = validateInput(
    dashboardQuerySchema,
    input,
    "Khoảng thời gian analytics chưa hợp lệ.",
  );
  const range = createRepositoryRange(parsed.from, parsed.to);
  const repository = await import("@/server/repositories/analytics.repository");
  const [
    metricRows,
    dailyRows,
    uniqueRows,
    topPostRows,
    topVideoRows,
    campaignRows,
    trafficSources,
    utmCampaigns,
    devices,
  ] = await executeRepository(() =>
    Promise.all([
      repository.findMetricTotals(range),
      repository.findDailyViews(range),
      repository.findEstimatedUniqueSessions(range),
      repository.findTopPosts(range, 8),
      repository.findTopVideos(range, 8),
      repository.findCampaignPerformance(range, 8),
      repository.findTrafficSources(range, 8),
      repository.findUtmCampaigns(range, 8),
      repository.findDeviceBreakdown(range, 8),
    ]),
  );
  const metrics = new Map(metricRows.map((row) => [row.metric, Number(row.value)]));
  const ranked = (rows: readonly { id: string | null; label: string; value: number }[]) =>
    rows
      .filter((row): row is { id: string; label: string; value: number } => Boolean(row.id))
      .map((row) => ({ id: row.id, label: row.label, value: Number(row.value) }));

  return {
    range: { from: parsed.from, to: parsed.to },
    totals: {
      pageViews: metrics.get("page_view") ?? 0,
      contentViews:
        (metrics.get("post_view") ?? 0)
        + (metrics.get("video_view") ?? 0)
        + (metrics.get("campaign_view") ?? 0),
      estimatedUniqueSessions: Number(uniqueRows[0]?.value ?? 0),
      socialClicks: metrics.get("social_click") ?? 0,
      campaignSubmissions: metrics.get("campaign_submit") ?? 0,
      contactSubmissions: metrics.get("contact_submit") ?? 0,
      newsletterSubmissions: metrics.get("newsletter_submit") ?? 0,
    },
    daily: fillDailyPoints(parsed.from, parsed.to, dailyRows),
    topPosts: ranked(topPostRows),
    topVideos: ranked(topVideoRows),
    campaigns: campaignRows
      .filter((row): row is typeof row & { id: string } => Boolean(row.id))
      .map((row) => ({
        id: row.id,
        label: row.label,
        views: Number(row.views),
        clicks: Number(row.clicks),
        submissions: Number(row.submissions),
        conversionRate:
          Number(row.views) > 0
            ? Number(((Number(row.submissions) / Number(row.views)) * 100).toFixed(2))
            : 0,
      })),
    trafficSources: ranked(trafficSources),
    utmCampaigns: ranked(utmCampaigns),
    devices: ranked(devices),
  };
}
