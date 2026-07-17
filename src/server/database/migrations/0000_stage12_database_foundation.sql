CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'upcoming', 'active', 'ended');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'scheduled', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('upcoming', 'live', 'ended', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('livestream', 'premiere', 'fan-meeting', 'giveaway', 'workshop', 'offline', 'launch');--> statement-breakpoint
CREATE TYPE "public"."media_provider" AS ENUM('r2', 'mux', 'external', 'local');--> statement-breakpoint
CREATE TYPE "public"."media_status" AS ENUM('pending', 'uploading', 'processing', 'ready', 'failed', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'document', 'video');--> statement-breakpoint
CREATE TYPE "public"."media_visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "public"."newsletter_status" AS ENUM('subscribed', 'unsubscribed', 'suppressed');--> statement-breakpoint
CREATE TYPE "public"."profile_status" AS ENUM('active', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."social_platform" AS ENUM('facebook', 'youtube', 'tiktok', 'instagram', 'x', 'threads', 'zalo', 'telegram', 'discord', 'website', 'email');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('new', 'reviewing', 'accepted', 'rejected', 'spam', 'archived');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'admin', 'editor', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."video_orientation" AS ENUM('landscape', 'portrait');--> statement-breakpoint
CREATE TYPE "public"."video_platform" AS ENUM('youtube', 'tiktok', 'instagram', 'facebook', 'internal');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"path" text NOT NULL,
	"referrer_domain" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"device_category" text,
	"country_code" text,
	"anonymous_session_hash" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_profile_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"before_data" jsonb,
	"after_data" jsonb,
	"request_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"banner_media_id" uuid,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"button_label" text NOT NULL,
	"button_url" text,
	"rules" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"terms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"submission_enabled" boolean DEFAULT true NOT NULL,
	"submission_limit" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "campaigns_end_after_start" CHECK ("campaigns"."end_at" > "campaigns"."start_at"),
	CONSTRAINT "campaigns_submission_limit_positive" CHECK ("campaigns"."submission_limit" is null or "campaigns"."submission_limit" > 0)
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"banner_media_id" uuid,
	"type" "event_type" NOT NULL,
	"event_status" "event_status" DEFAULT 'upcoming' NOT NULL,
	"content_status" "content_status" DEFAULT 'draft' NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone,
	"timezone" text DEFAULT 'Asia/Ho_Chi_Minh' NOT NULL,
	"location" text,
	"platform" text,
	"external_url" text,
	"schedule" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "events_end_after_start" CHECK ("events"."end_at" is null or "events"."end_at" > "events"."start_at")
);
--> statement-breakpoint
CREATE TABLE "gallery_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_asset_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"alt" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "media_type" NOT NULL,
	"provider" "media_provider" NOT NULL,
	"visibility" "media_visibility" DEFAULT 'public' NOT NULL,
	"status" "media_status" DEFAULT 'pending' NOT NULL,
	"object_key" text,
	"public_url" text,
	"original_filename" text,
	"mime_type" text NOT NULL,
	"extension" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"width" integer,
	"height" integer,
	"alt" text,
	"checksum" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "media_assets_size_non_negative" CHECK ("media_assets"."size_bytes" >= 0),
	CONSTRAINT "media_assets_width_positive" CHECK ("media_assets"."width" is null or "media_assets"."width" > 0),
	CONSTRAINT "media_assets_height_positive" CHECK ("media_assets"."height" is null or "media_assets"."height" > 0)
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_tags" (
	"post_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "post_tags_pk" PRIMARY KEY("post_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" jsonb NOT NULL,
	"thumbnail_media_id" uuid,
	"cover_media_id" uuid,
	"category_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"reading_time" integer DEFAULT 0 NOT NULL,
	"view_count" bigint DEFAULT 0 NOT NULL,
	"scheduled_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "posts_reading_time_non_negative" CHECK ("posts"."reading_time" >= 0),
	CONSTRAINT "posts_view_count_non_negative" CHECK ("posts"."view_count" >= 0),
	CONSTRAINT "posts_published_at_required" CHECK ("posts"."status" <> 'published' or "posts"."published_at" is not null),
	CONSTRAINT "posts_scheduled_at_required" CHECK ("posts"."status" <> 'scheduled' or "posts"."scheduled_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text,
	"display_name" text NOT NULL,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"status" "profile_status" DEFAULT 'active' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"settings_key" text DEFAULT 'default' NOT NULL,
	"site_name" text NOT NULL,
	"site_description" text NOT NULL,
	"locale" text DEFAULT 'vi-VN' NOT NULL,
	"creator_name" text NOT NULL,
	"username" text NOT NULL,
	"contact_email" text NOT NULL,
	"avatar_media_id" uuid,
	"cover_media_id" uuid,
	"theme" jsonb NOT NULL,
	"homepage_sections" jsonb NOT NULL,
	"navigation" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"homepage_content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"default_seo_title" text,
	"default_seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" "social_platform" NOT NULL,
	"label" text NOT NULL,
	"username" text,
	"url" text NOT NULL,
	"follower_count" bigint,
	"description" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "social_links_follower_count_non_negative" CHECK ("social_links"."follower_count" is null or "social_links"."follower_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "campaign_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"email_normalized" text NOT NULL,
	"phone" text,
	"followed_platform" text,
	"social_username" text,
	"notes" text,
	"status" "submission_status" DEFAULT 'new' NOT NULL,
	"source" text,
	"utm" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"email_normalized" text NOT NULL,
	"phone" text,
	"company" text,
	"collaboration_type" text NOT NULL,
	"budget_range" text,
	"message" text NOT NULL,
	"attachment_media_id" uuid,
	"status" "submission_status" DEFAULT 'new' NOT NULL,
	"source" text,
	"utm" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_normalized" text NOT NULL,
	"status" "newsletter_status" DEFAULT 'subscribed' NOT NULL,
	"source" text,
	"unsubscribe_token_hash" text NOT NULL,
	"subscribed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"platform" "video_platform" NOT NULL,
	"orientation" "video_orientation" NOT NULL,
	"topic" text NOT NULL,
	"external_url" text,
	"thumbnail_media_id" uuid,
	"video_media_id" uuid,
	"mux_upload_id" text,
	"mux_asset_id" text,
	"mux_playback_id" text,
	"duration_seconds" numeric(12, 3),
	"aspect_ratio" text,
	"processing_status" "media_status" DEFAULT 'pending' NOT NULL,
	"content_status" "content_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"view_count" bigint DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "videos_duration_non_negative" CHECK ("videos"."duration_seconds" is null or "videos"."duration_seconds" >= 0),
	CONSTRAINT "videos_view_count_non_negative" CHECK ("videos"."view_count" >= 0),
	CONSTRAINT "videos_external_url_required" CHECK ("videos"."platform" = 'internal' or "videos"."external_url" is not null)
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_profile_id_profiles_id_fk" FOREIGN KEY ("actor_profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_banner_media_id_media_assets_id_fk" FOREIGN KEY ("banner_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_banner_media_id_media_assets_id_fk" FOREIGN KEY ("banner_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_profiles_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_thumbnail_media_id_media_assets_id_fk" FOREIGN KEY ("thumbnail_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_media_id_media_assets_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_avatar_media_id_media_assets_id_fk" FOREIGN KEY ("avatar_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_cover_media_id_media_assets_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_submissions" ADD CONSTRAINT "campaign_submissions_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_attachment_media_id_media_assets_id_fk" FOREIGN KEY ("attachment_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_thumbnail_media_id_media_assets_id_fk" FOREIGN KEY ("thumbnail_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_video_media_id_media_assets_id_fk" FOREIGN KEY ("video_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_events_event_type_created_at_idx" ON "analytics_events" USING btree ("event_type","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "analytics_events_entity_created_at_idx" ON "analytics_events" USING btree ("entity_type","entity_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "audit_logs_actor_created_at_idx" ON "audit_logs" USING btree ("actor_profile_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "audit_logs_entity_created_at_idx" ON "audit_logs" USING btree ("entity_type","entity_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs" USING btree ("action","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "campaigns_slug_unique_idx" ON "campaigns" USING btree (lower("slug"));--> statement-breakpoint
CREATE INDEX "campaigns_status_start_end_idx" ON "campaigns" USING btree ("status","start_at","end_at");--> statement-breakpoint
CREATE INDEX "campaigns_start_at_idx" ON "campaigns" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "campaigns_end_at_idx" ON "campaigns" USING btree ("end_at");--> statement-breakpoint
CREATE INDEX "campaigns_featured_status_idx" ON "campaigns" USING btree ("featured","status");--> statement-breakpoint
CREATE INDEX "campaigns_created_at_idx" ON "campaigns" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "events_slug_unique_idx" ON "events" USING btree (lower("slug"));--> statement-breakpoint
CREATE INDEX "events_content_status_start_at_idx" ON "events" USING btree ("content_status","start_at");--> statement-breakpoint
CREATE INDEX "events_event_status_idx" ON "events" USING btree ("event_status");--> statement-breakpoint
CREATE INDEX "events_type_idx" ON "events" USING btree ("type");--> statement-breakpoint
CREATE INDEX "events_start_at_idx" ON "events" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "gallery_items_status_sort_order_idx" ON "gallery_items" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "gallery_items_category_status_idx" ON "gallery_items" USING btree ("category","status");--> statement-breakpoint
CREATE INDEX "gallery_items_published_at_idx" ON "gallery_items" USING btree ("published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "gallery_items_created_at_idx" ON "gallery_items" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_object_key_unique_idx" ON "media_assets" USING btree ("object_key") WHERE "media_assets"."object_key" is not null;--> statement-breakpoint
CREATE INDEX "media_assets_type_status_idx" ON "media_assets" USING btree ("type","status");--> statement-breakpoint
CREATE INDEX "media_assets_provider_status_idx" ON "media_assets" USING btree ("provider","status");--> statement-breakpoint
CREATE INDEX "media_assets_uploaded_by_idx" ON "media_assets" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "media_assets_created_at_idx" ON "media_assets" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_unique_idx" ON "categories" USING btree (lower("slug"));--> statement-breakpoint
CREATE INDEX "post_tags_tag_id_idx" ON "post_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_unique_idx" ON "posts" USING btree (lower("slug"));--> statement-breakpoint
CREATE INDEX "posts_status_published_at_idx" ON "posts" USING btree ("status","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "posts_featured_status_idx" ON "posts" USING btree ("featured","status");--> statement-breakpoint
CREATE INDEX "posts_category_id_idx" ON "posts" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "posts_author_id_idx" ON "posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "tags_slug_unique_idx" ON "tags" USING btree (lower("slug"));--> statement-breakpoint
CREATE INDEX "profiles_role_idx" ON "profiles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "profiles_status_idx" ON "profiles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "profiles_status_role_idx" ON "profiles" USING btree ("status","role");--> statement-breakpoint
CREATE UNIQUE INDEX "site_settings_key_unique_idx" ON "site_settings" USING btree ("settings_key");--> statement-breakpoint
CREATE INDEX "social_links_enabled_sort_order_idx" ON "social_links" USING btree ("enabled","sort_order");--> statement-breakpoint
CREATE INDEX "social_links_platform_idx" ON "social_links" USING btree ("platform");--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_submissions_campaign_email_unique_idx" ON "campaign_submissions" USING btree ("campaign_id","email_normalized");--> statement-breakpoint
CREATE INDEX "campaign_submissions_campaign_status_created_idx" ON "campaign_submissions" USING btree ("campaign_id","status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "campaign_submissions_email_normalized_idx" ON "campaign_submissions" USING btree ("email_normalized");--> statement-breakpoint
CREATE INDEX "campaign_submissions_created_at_idx" ON "campaign_submissions" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "contact_submissions_status_created_at_idx" ON "contact_submissions" USING btree ("status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "contact_submissions_email_normalized_idx" ON "contact_submissions" USING btree ("email_normalized");--> statement-breakpoint
CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_subscriptions_email_unique_idx" ON "newsletter_subscriptions" USING btree ("email_normalized");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_subscriptions_token_hash_unique_idx" ON "newsletter_subscriptions" USING btree ("unsubscribe_token_hash");--> statement-breakpoint
CREATE INDEX "newsletter_subscriptions_status_idx" ON "newsletter_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "newsletter_subscriptions_created_at_idx" ON "newsletter_subscriptions" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "videos_mux_upload_id_unique_idx" ON "videos" USING btree ("mux_upload_id") WHERE "videos"."mux_upload_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "videos_mux_asset_id_unique_idx" ON "videos" USING btree ("mux_asset_id") WHERE "videos"."mux_asset_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "videos_mux_playback_id_unique_idx" ON "videos" USING btree ("mux_playback_id") WHERE "videos"."mux_playback_id" is not null;--> statement-breakpoint
CREATE INDEX "videos_platform_content_status_idx" ON "videos" USING btree ("platform","content_status");--> statement-breakpoint
CREATE INDEX "videos_content_status_published_at_idx" ON "videos" USING btree ("content_status","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "videos_featured_content_status_idx" ON "videos" USING btree ("featured","content_status");--> statement-breakpoint
CREATE INDEX "videos_created_at_idx" ON "videos" USING btree ("created_at" DESC NULLS LAST);