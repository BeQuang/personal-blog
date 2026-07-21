CREATE TABLE "video_webhook_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"mux_object_id" text,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "video_webhook_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "processing_error" text;--> statement-breakpoint
CREATE INDEX "video_webhook_events_type_processed_at_idx" ON "video_webhook_events" USING btree ("event_type","processed_at" DESC NULLS LAST);