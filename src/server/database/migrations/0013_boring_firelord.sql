CREATE TABLE "social_oauth_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"social_link_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"access_token_ciphertext" text NOT NULL,
	"refresh_token_ciphertext" text NOT NULL,
	"access_token_expires_at" timestamp with time zone NOT NULL,
	"refresh_token_expires_at" timestamp with time zone NOT NULL,
	"scopes" text NOT NULL,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "social_oauth_connections_provider_valid" CHECK ("social_oauth_connections"."provider" in ('tiktok'))
);
--> statement-breakpoint
ALTER TABLE "social_oauth_connections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "social_links" DROP CONSTRAINT "social_links_audience_source_valid";--> statement-breakpoint
ALTER TABLE "social_links" ADD COLUMN "likes_count" bigint;--> statement-breakpoint
ALTER TABLE "social_oauth_connections" ADD CONSTRAINT "social_oauth_connections_social_link_id_social_links_id_fk" FOREIGN KEY ("social_link_id") REFERENCES "public"."social_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "social_oauth_connections_social_link_unique" ON "social_oauth_connections" USING btree ("social_link_id");--> statement-breakpoint
CREATE INDEX "social_oauth_connections_provider_idx" ON "social_oauth_connections" USING btree ("provider");--> statement-breakpoint
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_likes_count_non_negative" CHECK ("social_links"."likes_count" is null or "social_links"."likes_count" >= 0);--> statement-breakpoint
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_audience_source_valid" CHECK ("social_links"."audience_source" in ('manual', 'youtube_api', 'tiktok_api', 'none'));