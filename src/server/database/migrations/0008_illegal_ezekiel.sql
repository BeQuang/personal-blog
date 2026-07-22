CREATE TABLE "daily_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"metric" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"dimensions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"dimensions_hash" text NOT NULL,
	"value" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_analytics_metric_dimensions_unique" UNIQUE NULLS NOT DISTINCT("date","metric","entity_type","entity_id","dimensions_hash")
);
--> statement-breakpoint
ALTER TABLE "daily_analytics" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "daily_analytics_date_metric_idx" ON "daily_analytics" USING btree ("date","metric");--> statement-breakpoint
CREATE INDEX "daily_analytics_entity_date_idx" ON "daily_analytics" USING btree ("entity_type","entity_id","date");--> statement-breakpoint
CREATE INDEX "analytics_events_session_created_at_idx" ON "analytics_events" USING btree ("anonymous_session_hash","created_at" DESC NULLS LAST);
--> statement-breakpoint
CREATE POLICY "daily_analytics_authorized_select"
ON public.daily_analytics FOR SELECT TO authenticated
USING (public.has_app_role(ARRAY[
	'super_admin'::public.user_role,
	'admin'::public.user_role,
	'viewer'::public.user_role
]));
