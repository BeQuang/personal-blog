import "server-only";

import {
  and,
  count,
  desc,
  eq,
  gte,
  inArray,
  lt,
  lte,
  sql,
} from "drizzle-orm";

import { database } from "@/server/database/client";
import {
  analyticsEvents,
  campaigns,
  dailyAnalytics,
  posts,
  videos,
} from "@/server/database/schema";

export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;

export interface AnalyticsAggregateIncrement {
  date: string;
  metric: string;
  entityType?: string;
  entityId?: string;
  dimensions: Record<string, string>;
  dimensionsHash: string;
}

export interface AnalyticsRepositoryRange {
  from: string;
  to: string;
  startAt: Date;
  endAtExclusive: Date;
}

export async function insertAnalyticsEvent(
  event: NewAnalyticsEvent,
  aggregates: readonly AnalyticsAggregateIncrement[],
) {
  return database.transaction(async (transaction) => {
    const [created] = await transaction
      .insert(analyticsEvents)
      .values(event)
      .returning({ id: analyticsEvents.id });
    const now = new Date();

    for (const aggregate of aggregates) {
      await transaction
        .insert(dailyAnalytics)
        .values({
          date: aggregate.date,
          metric: aggregate.metric,
          entityType: aggregate.entityType,
          entityId: aggregate.entityId,
          dimensions: aggregate.dimensions,
          dimensionsHash: aggregate.dimensionsHash,
          value: 1,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [
            dailyAnalytics.date,
            dailyAnalytics.metric,
            dailyAnalytics.entityType,
            dailyAnalytics.entityId,
            dailyAnalytics.dimensionsHash,
          ],
          set: {
            value: sql`${dailyAnalytics.value} + 1`,
            updatedAt: now,
          },
        });
    }

    return created;
  });
}

export function findMetricTotals(range: AnalyticsRepositoryRange) {
  return database
    .select({
      metric: dailyAnalytics.metric,
      value: sql<number>`coalesce(sum(${dailyAnalytics.value}), 0)::double precision`,
    })
    .from(dailyAnalytics)
    .where(and(gte(dailyAnalytics.date, range.from), lte(dailyAnalytics.date, range.to)))
    .groupBy(dailyAnalytics.metric);
}

export function findDailyViews(range: AnalyticsRepositoryRange) {
  return database
    .select({
      date: dailyAnalytics.date,
      pageViews: sql<number>`coalesce(sum(${dailyAnalytics.value}) filter (where ${dailyAnalytics.metric} = 'page_view'), 0)::double precision`,
      contentViews: sql<number>`coalesce(sum(${dailyAnalytics.value}) filter (where ${dailyAnalytics.metric} in ('post_view', 'video_view', 'campaign_view')), 0)::double precision`,
    })
    .from(dailyAnalytics)
    .where(
      and(
        gte(dailyAnalytics.date, range.from),
        lte(dailyAnalytics.date, range.to),
        inArray(dailyAnalytics.metric, [
          "page_view",
          "post_view",
          "video_view",
          "campaign_view",
        ]),
      ),
    )
    .groupBy(dailyAnalytics.date)
    .orderBy(dailyAnalytics.date);
}

export function findEstimatedUniqueSessions(range: AnalyticsRepositoryRange) {
  return database
    .select({
      value: sql<number>`count(distinct ${analyticsEvents.anonymousSessionHash})::double precision`,
    })
    .from(analyticsEvents)
    .where(
      and(
        gte(analyticsEvents.createdAt, range.startAt),
        lt(analyticsEvents.createdAt, range.endAtExclusive),
      ),
    );
}

export function findTopPosts(range: AnalyticsRepositoryRange, limit: number) {
  const value = sql<number>`sum(${dailyAnalytics.value})::double precision`;
  return database
    .select({
      id: dailyAnalytics.entityId,
      label: sql<string>`coalesce(${posts.title}, ${dailyAnalytics.entityId})`,
      value,
    })
    .from(dailyAnalytics)
    .leftJoin(posts, sql`${posts.id}::text = ${dailyAnalytics.entityId}`)
    .where(
      and(
        eq(dailyAnalytics.metric, "post_view"),
        gte(dailyAnalytics.date, range.from),
        lte(dailyAnalytics.date, range.to),
      ),
    )
    .groupBy(dailyAnalytics.entityId, posts.title)
    .orderBy(desc(value))
    .limit(limit);
}

export function findTopVideos(range: AnalyticsRepositoryRange, limit: number) {
  const value = sql<number>`sum(${dailyAnalytics.value})::double precision`;
  return database
    .select({
      id: dailyAnalytics.entityId,
      label: sql<string>`coalesce(${videos.title}, ${dailyAnalytics.entityId})`,
      value,
    })
    .from(dailyAnalytics)
    .leftJoin(videos, sql`${videos.id}::text = ${dailyAnalytics.entityId}`)
    .where(
      and(
        eq(dailyAnalytics.metric, "video_view"),
        gte(dailyAnalytics.date, range.from),
        lte(dailyAnalytics.date, range.to),
      ),
    )
    .groupBy(dailyAnalytics.entityId, videos.title)
    .orderBy(desc(value))
    .limit(limit);
}

export function findCampaignPerformance(
  range: AnalyticsRepositoryRange,
  limit: number,
) {
  const views = sql<number>`coalesce(sum(${dailyAnalytics.value}) filter (where ${dailyAnalytics.metric} = 'campaign_view'), 0)::double precision`;
  const clicks = sql<number>`coalesce(sum(${dailyAnalytics.value}) filter (where ${dailyAnalytics.metric} = 'campaign_click'), 0)::double precision`;
  const submissions = sql<number>`coalesce(sum(${dailyAnalytics.value}) filter (where ${dailyAnalytics.metric} = 'campaign_submit'), 0)::double precision`;
  return database
    .select({
      id: dailyAnalytics.entityId,
      label: sql<string>`coalesce(${campaigns.title}, ${dailyAnalytics.entityId})`,
      views,
      clicks,
      submissions,
    })
    .from(dailyAnalytics)
    .leftJoin(campaigns, sql`${campaigns.id}::text = ${dailyAnalytics.entityId}`)
    .where(
      and(
        inArray(dailyAnalytics.metric, [
          "campaign_view",
          "campaign_click",
          "campaign_submit",
        ]),
        gte(dailyAnalytics.date, range.from),
        lte(dailyAnalytics.date, range.to),
      ),
    )
    .groupBy(dailyAnalytics.entityId, campaigns.title)
    .orderBy(desc(views), desc(clicks))
    .limit(limit);
}

function findDimensionBreakdown(
  range: AnalyticsRepositoryRange,
  metric: "traffic_source" | "utm_campaign" | "device_category",
  dimensionKey: "source" | "campaign" | "device",
  limit: number,
) {
  const label = sql<string>`coalesce(${dailyAnalytics.dimensions} ->> ${dimensionKey}, 'unknown')`;
  const value = sql<number>`sum(${dailyAnalytics.value})::double precision`;
  return database
    .select({ id: label, label, value })
    .from(dailyAnalytics)
    .where(
      and(
        eq(dailyAnalytics.metric, metric),
        gte(dailyAnalytics.date, range.from),
        lte(dailyAnalytics.date, range.to),
      ),
    )
    .groupBy(dailyAnalytics.dimensions)
    .orderBy(desc(value))
    .limit(limit);
}

export function findTrafficSources(range: AnalyticsRepositoryRange, limit: number) {
  return findDimensionBreakdown(range, "traffic_source", "source", limit);
}

export function findUtmCampaigns(range: AnalyticsRepositoryRange, limit: number) {
  return findDimensionBreakdown(range, "utm_campaign", "campaign", limit);
}

export function findDeviceBreakdown(range: AnalyticsRepositoryRange, limit: number) {
  return findDimensionBreakdown(range, "device_category", "device", limit);
}

export async function findRecentEvents(
  range: AnalyticsRepositoryRange,
  page: number,
  pageSize: number,
) {
  const where = and(
    gte(analyticsEvents.createdAt, range.startAt),
    lt(analyticsEvents.createdAt, range.endAtExclusive),
  );
  const [items, totals] = await Promise.all([
    database
      .select({
        id: analyticsEvents.id,
        eventType: analyticsEvents.eventType,
        entityType: analyticsEvents.entityType,
        entityId: analyticsEvents.entityId,
        path: analyticsEvents.path,
        referrerDomain: analyticsEvents.referrerDomain,
        deviceCategory: analyticsEvents.deviceCategory,
        createdAt: analyticsEvents.createdAt,
      })
      .from(analyticsEvents)
      .where(where)
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    database.select({ total: count() }).from(analyticsEvents).where(where),
  ]);

  return { items, total: totals[0]?.total ?? 0 };
}

export function deleteAnalyticsEventsBefore(cutoff: Date) {
  return database.delete(analyticsEvents).where(lt(analyticsEvents.createdAt, cutoff));
}
