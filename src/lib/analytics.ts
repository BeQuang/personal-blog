type AnalyticsEvent =
  | { name: "social_click"; payload: { platform: string } }
  | { name: "post_view"; payload: { slug: string } }
  | { name: "video_click"; payload: { videoId: string } }
  | { name: "campaign_click"; payload: { campaignId: string } }
  | { name: "newsletter_submit"; payload: { source: "homepage" } };

function trackEvent(event: AnalyticsEvent): void {
  if (process.env.NODE_ENV === "development") {
    console.info(event.name, event.payload);
  }
}

export function trackSocialClick(platform: string): void {
  trackEvent({ name: "social_click", payload: { platform } });
}

export function trackPostView(slug: string): void {
  trackEvent({ name: "post_view", payload: { slug } });
}

export function trackVideoClick(videoId: string): void {
  trackEvent({ name: "video_click", payload: { videoId } });
}

export function trackCampaignClick(campaignId: string): void {
  trackEvent({ name: "campaign_click", payload: { campaignId } });
}

export function trackNewsletterSubmit(): void {
  trackEvent({ name: "newsletter_submit", payload: { source: "homepage" } });
}
