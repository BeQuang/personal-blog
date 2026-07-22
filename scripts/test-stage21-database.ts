import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

if (existsSync(".env.local")) loadEnvFile(".env.local");

async function main() {
  const { postgresClient } = await import("../src/server/database/client");
  try {
  const requiredTables = [
    "profiles", "site_settings", "social_links", "categories", "tags", "posts",
    "post_tags", "media_assets", "videos", "gallery_items", "events", "campaigns",
    "campaign_submissions", "contact_submissions", "newsletter_subscriptions",
    "analytics_events", "daily_analytics", "audit_logs", "video_webhook_events",
  ];
  const rlsRows = await postgresClient<{ relname: string; relrowsecurity: boolean }[]>`
    select c.relname, c.relrowsecurity
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname in ${postgresClient(requiredTables)}
  `;
  assert.equal(rlsRows.length, requiredTables.length);
  assert.equal(rlsRows.every((row) => row.relrowsecurity), true);

  const policies = await postgresClient<{ policyname: string; cmd: string }[]>`
    select policyname, cmd from pg_policies
    where schemaname = 'public' and tablename = 'media_assets'
  `;
  assert.equal(policies.some((row) => row.policyname === "media_assets_content_roles_all"), false);
  assert.equal(policies.some((row) => row.policyname === "media_assets_admin_all" && row.cmd === "ALL"), true);
  assert.equal(policies.some((row) => row.policyname === "media_assets_editor_select" && row.cmd === "SELECT"), true);

  const indexes = await postgresClient<{ indexname: string }[]>`
    select indexname from pg_indexes
    where schemaname = 'public' and indexname in (
      'posts_slug_unique_idx',
      'events_slug_unique_idx',
      'campaigns_slug_unique_idx',
      'media_assets_object_key_unique_idx',
      'analytics_events_event_type_created_at_idx'
    )
  `;
  assert.equal(indexes.length, 5);

  const invalidForeignKeys = await postgresClient<{ constraint_name: string }[]>`
    select tc.constraint_name
    from information_schema.table_constraints tc
    left join information_schema.referential_constraints rc
      on rc.constraint_schema = tc.constraint_schema
      and rc.constraint_name = tc.constraint_name
    where tc.table_schema = 'public'
      and tc.constraint_type = 'FOREIGN KEY'
      and rc.constraint_name is null
  `;
  assert.equal(invalidForeignKeys.length, 0);

  console.log("Stage 21 database constraints, indexes and RLS: Passed");
  } finally {
    await postgresClient.end({ timeout: 5 });
  }
}

void main();
