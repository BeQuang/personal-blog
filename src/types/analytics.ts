import type {
  analyticsEventTypes,
  clientAnalyticsEventTypes,
} from "@/config/analytics.config";

export type AnalyticsEventType = (typeof analyticsEventTypes)[number];
export type ClientAnalyticsEventType = (typeof clientAnalyticsEventTypes)[number];
export type AnalyticsEntityType = "post" | "video" | "social" | "campaign";
export type AnalyticsDeviceCategory = "desktop" | "mobile" | "tablet" | "unknown";

export interface ClientAnalyticsEventInput {
  eventType: ClientAnalyticsEventType;
  entityType?: AnalyticsEntityType;
  entityId?: string;
  path: string;
  referrerDomain?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  sessionId?: string;
}

export interface AnalyticsDateRange {
  from: string;
  to: string;
}

export interface AnalyticsDailyPoint {
  date: string;
  pageViews: number;
  contentViews: number;
}

export interface AnalyticsRankedItem {
  id: string;
  label: string;
  value: number;
}

export interface AnalyticsCampaignPerformance {
  id: string;
  label: string;
  views: number;
  clicks: number;
  submissions: number;
  conversionRate: number;
}

export interface AnalyticsRecentEvent {
  id: string;
  eventType: AnalyticsEventType;
  entityType?: string;
  entityId?: string;
  path: string;
  referrerDomain?: string;
  deviceCategory?: AnalyticsDeviceCategory;
  createdAt: string;
}

export interface AnalyticsDashboardData {
  range: AnalyticsDateRange;
  totals: {
    pageViews: number;
    contentViews: number;
    estimatedUniqueSessions: number;
    socialClicks: number;
    campaignSubmissions: number;
    contactSubmissions: number;
    newsletterSubmissions: number;
  };
  daily: readonly AnalyticsDailyPoint[];
  topPosts: readonly AnalyticsRankedItem[];
  topVideos: readonly AnalyticsRankedItem[];
  campaigns: readonly AnalyticsCampaignPerformance[];
  trafficSources: readonly AnalyticsRankedItem[];
  utmCampaigns: readonly AnalyticsRankedItem[];
  devices: readonly AnalyticsRankedItem[];
  recentEvents: {
    items: readonly AnalyticsRecentEvent[];
    total: number;
    page: number;
    pageSize: number;
  };
}

