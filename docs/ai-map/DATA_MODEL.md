# Data model map

> Generated artifact — source fingerprint: `8252c88eef46471c254b01d8b5d8224d2f9e547cf7019f773dc7147e06d07749`

## PostgreSQL tables

| Table | Drizzle symbol | Schema file |
| --- | --- | --- |
| `analytics_events` | `analyticsEvents` | `src/server/database/schema/analytics.ts` |
| `audit_logs` | `auditLogs` | `src/server/database/schema/audit-logs.ts` |
| `campaign_submissions` | `campaignSubmissions` | `src/server/database/schema/submissions.ts` |
| `campaigns` | `campaigns` | `src/server/database/schema/campaigns.ts` |
| `categories` | `categories` | `src/server/database/schema/posts.ts` |
| `contact_submissions` | `contactSubmissions` | `src/server/database/schema/submissions.ts` |
| `daily_analytics` | `dailyAnalytics` | `src/server/database/schema/analytics.ts` |
| `events` | `events` | `src/server/database/schema/events.ts` |
| `gallery_items` | `galleryItems` | `src/server/database/schema/gallery.ts` |
| `media_assets` | `mediaAssets` | `src/server/database/schema/media.ts` |
| `newsletter_subscriptions` | `newsletterSubscriptions` | `src/server/database/schema/submissions.ts` |
| `post_tags` | `postTags` | `src/server/database/schema/posts.ts` |
| `posts` | `posts` | `src/server/database/schema/posts.ts` |
| `profiles` | `profiles` | `src/server/database/schema/profiles.ts` |
| `site_settings` | `siteSettings` | `src/server/database/schema/site-settings.ts` |
| `social_links` | `socialLinks` | `src/server/database/schema/social-links.ts` |
| `tags` | `tags` | `src/server/database/schema/posts.ts` |
| `video_webhook_events` | `videoWebhookEvents` | `src/server/database/schema/videos.ts` |
| `videos` | `videos` | `src/server/database/schema/videos.ts` |

## PostgreSQL enums

| Enum | Giá trị | Schema file |
| --- | --- | --- |
| `campaign_status` | `draft`, `upcoming`, `active`, `ended` | `src/server/database/schema/enums.ts` |
| `content_status` | `draft`, `scheduled`, `published`, `archived` | `src/server/database/schema/enums.ts` |
| `event_status` | `upcoming`, `live`, `ended`, `cancelled` | `src/server/database/schema/enums.ts` |
| `event_type` | `livestream`, `premiere`, `fan-meeting`, `giveaway`, `workshop`, `offline`, `launch` | `src/server/database/schema/enums.ts` |
| `media_provider` | `r2`, `mux`, `external`, `local` | `src/server/database/schema/enums.ts` |
| `media_status` | `pending`, `uploading`, `processing`, `ready`, `failed`, `deleted` | `src/server/database/schema/enums.ts` |
| `media_type` | `image`, `document`, `video` | `src/server/database/schema/enums.ts` |
| `media_visibility` | `public`, `private` | `src/server/database/schema/enums.ts` |
| `newsletter_status` | `subscribed`, `unsubscribed`, `suppressed` | `src/server/database/schema/enums.ts` |
| `profile_status` | `active`, `disabled` | `src/server/database/schema/enums.ts` |
| `social_platform` | `facebook`, `youtube`, `tiktok`, `instagram`, `x`, `threads`, `zalo`, `telegram`, `discord`, `website`, `email` | `src/server/database/schema/enums.ts` |
| `submission_status` | `new`, `read`, `replied`, `reviewing`, `accepted`, `rejected`, `spam`, `archived` | `src/server/database/schema/enums.ts` |
| `user_role` | `super_admin`, `admin`, `editor`, `viewer` | `src/server/database/schema/enums.ts` |
| `video_orientation` | `landscape`, `portrait` | `src/server/database/schema/enums.ts` |
| `video_platform` | `youtube`, `tiktok`, `instagram`, `facebook`, `internal` | `src/server/database/schema/enums.ts` |

## Migration

- `src/server/database/migrations/0000_stage12_database_foundation.sql`
- `src/server/database/migrations/0001_enable_rls.sql`
- `src/server/database/migrations/0002_swift_rumiko_fujikawa.sql`
- `src/server/database/migrations/0003_stage13_auth_rls.sql`
- `src/server/database/migrations/0004_stage13_tighten_editor_rls.sql`
- `src/server/database/migrations/0005_stage15_tighten_taxonomy_rls.sql`
- `src/server/database/migrations/0006_daffy_william_stryker.sql`
- `src/server/database/migrations/0007_silky_robin_chapel.sql`
- `src/server/database/migrations/0008_illegal_ezekiel.sql`
- `src/server/database/migrations/0009_stage21-production-hardening.sql`
- `src/server/database/migrations/meta/_journal.json`
- `src/server/database/migrations/meta/0000_snapshot.json`
- `src/server/database/migrations/meta/0001_snapshot.json`
- `src/server/database/migrations/meta/0002_snapshot.json`
- `src/server/database/migrations/meta/0003_snapshot.json`
- `src/server/database/migrations/meta/0004_snapshot.json`
- `src/server/database/migrations/meta/0005_snapshot.json`
- `src/server/database/migrations/meta/0006_snapshot.json`
- `src/server/database/migrations/meta/0007_snapshot.json`
- `src/server/database/migrations/meta/0008_snapshot.json`
- `src/server/database/migrations/meta/0009_snapshot.json`
