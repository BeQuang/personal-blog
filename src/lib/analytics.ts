import {
  analyticsConsentStorageKey,
  analyticsSessionStorageKey,
} from "@/config/analytics.config";
import type {
  AnalyticsEntityType,
  ClientAnalyticsEventInput,
  ClientAnalyticsEventType,
} from "@/types";

const recentlySent = new Map<string, number>();

export function isClientAnalyticsEnabled() {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "false";
}

export function hasAnalyticsConsent() {
  return typeof window !== "undefined"
    && window.localStorage.getItem(analyticsConsentStorageKey) === "granted";
}

function getSessionId() {
  const existing = window.sessionStorage.getItem(analyticsSessionStorageKey);
  if (existing) return existing;
  const sessionId = crypto.randomUUID();
  window.sessionStorage.setItem(analyticsSessionStorageKey, sessionId);
  return sessionId;
}

function getReferrerDomain() {
  if (!document.referrer) return undefined;
  try {
    return new URL(document.referrer).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

function getUtmValue(params: URLSearchParams, key: string) {
  return params.get(key)?.trim().slice(0, 120) || undefined;
}

function trackEvent(
  eventType: ClientAnalyticsEventType,
  entityType?: AnalyticsEntityType,
  entityId?: string,
) {
  if (!isClientAnalyticsEnabled() || !hasAnalyticsConsent()) return;
  const path = window.location.pathname;
  if (path.startsWith("/admin") || path.startsWith("/api") || path.startsWith("/auth")) {
    return;
  }

  const dedupeKey = `${eventType}:${entityType ?? "page"}:${entityId ?? path}:${path}`;
  const now = Date.now();
  if (now - (recentlySent.get(dedupeKey) ?? 0) < 1_000) return;
  recentlySent.set(dedupeKey, now);

  const params = new URLSearchParams(window.location.search);
  const payload: ClientAnalyticsEventInput = {
    eventType,
    ...(entityType ? { entityType } : {}),
    ...(entityId ? { entityId } : {}),
    path,
    referrerDomain: getReferrerDomain(),
    utmSource: getUtmValue(params, "utm_source"),
    utmMedium: getUtmValue(params, "utm_medium"),
    utmCampaign: getUtmValue(params, "utm_campaign"),
    sessionId: getSessionId(),
  };

  void fetch("/api/analytics/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => undefined);
}

export function trackPageView() {
  trackEvent("page_view");
}

export function trackSocialClick(platform: string) {
  trackEvent("social_click", "social", platform);
}

export function trackPostView(postId: string) {
  trackEvent("post_view", "post", postId);
}

export function trackVideoView(videoId: string) {
  trackEvent("video_view", "video", videoId);
}

export function trackVideoClick(videoId: string) {
  trackVideoView(videoId);
}

export function trackCampaignView(campaignId: string) {
  trackEvent("campaign_view", "campaign", campaignId);
}

export function trackCampaignClick(campaignId: string) {
  trackEvent("campaign_click", "campaign", campaignId);
}
