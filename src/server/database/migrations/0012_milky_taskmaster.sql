ALTER TABLE "social_links" ADD COLUMN "external_id" text;--> statement-breakpoint
ALTER TABLE "social_links" ADD COLUMN "audience_source" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "social_links" ADD COLUMN "audience_sync_status" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "social_links" ADD COLUMN "audience_last_synced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "social_links" ADD COLUMN "audience_sync_error" text;--> statement-breakpoint
UPDATE "social_links"
SET
  "follower_count" = NULL,
  "audience_source" = 'youtube_api',
  "audience_sync_status" = 'pending'
WHERE "platform" = 'youtube';--> statement-breakpoint
UPDATE "social_links"
SET
  "follower_count" = NULL,
  "audience_source" = 'none',
  "audience_sync_status" = 'unavailable'
WHERE "platform" IN ('email', 'website');--> statement-breakpoint
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_audience_source_valid" CHECK ("social_links"."audience_source" in ('manual', 'youtube_api', 'none'));--> statement-breakpoint
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_audience_sync_status_valid" CHECK ("social_links"."audience_sync_status" in ('manual', 'pending', 'synced', 'error', 'unavailable'));
