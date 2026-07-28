CREATE INDEX "gallery_items_sort_order_idx" ON "gallery_items" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "categories_name_idx" ON "categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "tags_name_idx" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "social_links_sort_order_idx" ON "social_links" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "videos_updated_at_idx" ON "videos" USING btree ("updated_at" DESC NULLS LAST);