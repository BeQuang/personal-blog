import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

if (existsSync(".env.local")) {
  loadEnvFile(".env.local");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  process.env.USE_DATABASE_CONTENT = "false";
  process.env.DATABASE_URL = "";

  const [postsService, socialService, videosService, galleryService, eventsService, campaignsService, settingsService, submissionsMapper] = await Promise.all([
    import("../src/server/services/posts.service"),
    import("../src/server/services/social-links.service"),
    import("../src/server/services/videos.service"),
    import("../src/server/services/gallery.service"),
    import("../src/server/services/events.service"),
    import("../src/server/services/campaigns.service"),
    import("../src/server/services/settings.service"),
    import("../src/server/mappers/submissions.mapper"),
  ]);

  const mockPosts = await postsService.getPublishedPosts();
  const mockCampaigns = await campaignsService.getCampaigns();
  const mockEvents = await eventsService.getEvents();
  assert(mockPosts.length === 7, "Mock fallback did not return the expected posts");
  assert(
    await postsService.getPostBySlug("7-bai-hoc-xay-dung-kenh-tiktok-tu-con-so-0"),
    "Mock post facade alias failed",
  );
  assert(mockCampaigns.length === 4, "Mock fallback did not preserve draft campaigns");
  assert(
    mockEvents.every(
      (event, index) =>
        index === 0 ||
        new Date(mockEvents[index - 1].startAt).getTime() >= new Date(event.startAt).getTime(),
    ),
    "Mock events are not sorted by start time descending",
  );
  assert(databaseUrl, "DATABASE_URL is required for the database smoke test");

  process.env.DATABASE_URL = databaseUrl;
  process.env.USE_DATABASE_CONTENT = "true";

  const [databasePosts, socialLinks, videos, gallery, events, campaigns, publicCampaigns, settings] = await Promise.all([
    postsService.getPublishedPosts(),
    socialService.getEnabledSocialLinks(),
    videosService.getVideos(),
    galleryService.getGalleryItems(),
    eventsService.getEvents(),
    campaignsService.getCampaigns(),
    campaignsService.getPublicCampaigns(),
    settingsService.getSiteSettings(),
  ]);

  assert(databasePosts.length >= 7, "Seeded database posts are missing");
  assert(socialLinks.length >= 7, "Seeded database social links are missing");
  assert(videos.length >= 8, "Seeded database videos are missing");
  assert(gallery.length >= 10, "Seeded database gallery items are missing");
  assert(events.length >= 5, "Seeded database events are missing");
  assert(campaigns.length >= 4, "Seeded database campaigns are missing");
  assert(publicCampaigns.length >= 3, "Seeded public campaigns are missing");
  assert(campaigns.some((campaign) => campaign.status === "draft"), "Draft campaign mapping failed");
  assert(settings.siteName.length > 0, "Database settings were not mapped");
  assert(databasePosts.every((post) => post.thumbnail), "Post media mapping failed");
  assert(
    await postsService.getPostBySlug("7-bai-hoc-xay-dung-kenh-tiktok-tu-con-so-0"),
    "Database post facade alias failed",
  );
  assert(
    await campaignsService.getCampaignBySlug("media-kit-danh-cho-doi-tac-2027"),
    "Admin campaign lookup lost the draft campaign",
  );
  assert(
    !(await campaignsService.getPublicCampaignBySlug("media-kit-danh-cho-doi-tac-2027")),
    "Public campaign lookup exposed a draft campaign",
  );

  const newsletterDto = submissionsMapper.mapNewsletterSubscriptionRow({
    id: "11111111-1111-4111-8111-111111111111",
    email: "reader@example.com",
    emailNormalized: "reader@example.com",
    status: "subscribed",
    source: "stage14-smoke",
    unsubscribeTokenHash: "must-not-leave-the-service-layer",
    subscribedAt: new Date("2026-01-01T00:00:00.000Z"),
    unsubscribedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  });
  assert(
    !("unsubscribeTokenHash" in newsletterDto),
    "Newsletter DTO exposed the unsubscribe token hash",
  );

  console.log(
    JSON.stringify({
      database: {
        campaigns: campaigns.length,
        publicCampaigns: publicCampaigns.length,
        events: events.length,
        gallery: gallery.length,
        posts: databasePosts.length,
        socialLinks: socialLinks.length,
        videos: videos.length,
      },
      mockFallback: {
        campaigns: mockCampaigns.length,
        events: mockEvents.length,
        posts: mockPosts.length,
      },
    }),
  );

  const { postgresClient } = await import("../src/server/database/client");
  await postgresClient.end({ timeout: 5 });
}

void main();
