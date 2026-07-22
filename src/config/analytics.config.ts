export const analyticsEventTypes = [
  "page_view",
  "post_view",
  "video_view",
  "social_click",
  "campaign_view",
  "campaign_click",
  "campaign_submit",
  "contact_submit",
  "newsletter_submit",
] as const;

export const clientAnalyticsEventTypes = [
  "page_view",
  "post_view",
  "video_view",
  "social_click",
  "campaign_view",
  "campaign_click",
] as const;

export const analyticsConsentStorageKey = "personal-blog:analytics-consent";
export const analyticsSessionStorageKey = "personal-blog:analytics-session";
export const analyticsPayloadLimitBytes = 4_096;
export const analyticsRawRetentionDays = 90;

