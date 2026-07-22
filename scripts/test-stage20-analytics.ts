import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

async function main() {
  if (existsSync(".env.local")) loadEnvFile(".env.local");

  const entityId = randomUUID();
  const path = `/__stage20-test__/${entityId}`;
  const sessionId = randomUUID();
  const [
    { database, postgresClient },
    schema,
    service,
    repository,
    errors,
    operators,
    auth,
  ] = await Promise.all([
    import("../src/server/database/client"),
    import("../src/server/database/schema"),
    import("../src/server/services/analytics.service"),
    import("../src/server/repositories/analytics.repository"),
    import("../src/server/errors"),
    import("drizzle-orm"),
    import("../src/server/auth/permissions"),
  ]);

  try {
    assert.equal(auth.hasPermission("editor", "dashboard:view"), true);
    assert.equal(auth.hasPermission("editor", "analytics:view"), false);

    const [tableRows, indexRows, policyRows, rlsRows] = await Promise.all([
      postgresClient`
        select exists (
          select 1 from information_schema.tables
          where table_schema = 'public' and table_name = 'daily_analytics'
        ) as exists
      `,
      postgresClient`
        select indexname from pg_indexes
        where schemaname = 'public'
          and indexname in (
            'daily_analytics_date_metric_idx',
            'daily_analytics_entity_date_idx',
            'analytics_events_session_created_at_idx'
          )
      `,
      postgresClient`
        select exists (
          select 1 from pg_policies
          where schemaname = 'public'
            and tablename = 'daily_analytics'
            and policyname = 'daily_analytics_authorized_select'
        ) as exists
      `,
      postgresClient`
        select relrowsecurity as enabled
        from pg_class
        join pg_namespace on pg_namespace.oid = pg_class.relnamespace
        where pg_namespace.nspname = 'public' and pg_class.relname = 'daily_analytics'
      `,
    ]);
    assert.equal(tableRows[0]?.exists, true);
    assert.equal(indexRows.length, 3);
    assert.equal(policyRows[0]?.exists, true);
    assert.equal(rlsRows[0]?.enabled, true);

    const today = new Date().toISOString().slice(0, 10);
    const startAt = new Date(`${today}T00:00:00.000Z`);
    const endAtExclusive = new Date(startAt);
    endAtExclusive.setUTCDate(endAtExclusive.getUTCDate() + 1);
    const range = { from: today, to: today, startAt, endAtExclusive };
    await Promise.all([
      repository.findTrafficSources(range, 8),
      repository.findUtmCampaigns(range, 8),
      repository.findDeviceBreakdown(range, 8),
    ]);

    await assert.rejects(
      () => service.ingestClientAnalyticsEvent(
        {
          eventType: "campaign_submit",
          entityType: "campaign",
          entityId,
          path,
        },
        { fingerprint: randomUUID() },
        {},
      ),
      errors.ValidationError,
    );

    const result = await service.ingestClientAnalyticsEvent(
      {
        eventType: "post_view",
        entityType: "post",
        entityId,
        path,
        sessionId,
        utmCampaign: "stage20-test",
      },
      { fingerprint: randomUUID() },
      { userAgent: "Stage20 Desktop Test" },
    );
    assert.equal(result.accepted, true);

    const [events, aggregates] = await Promise.all([
      database
        .select({
          eventType: schema.analyticsEvents.eventType,
          sessionHash: schema.analyticsEvents.anonymousSessionHash,
        })
        .from(schema.analyticsEvents)
        .where(operators.eq(schema.analyticsEvents.entityId, entityId)),
      database
        .select({
          metric: schema.dailyAnalytics.metric,
          value: schema.dailyAnalytics.value,
        })
        .from(schema.dailyAnalytics)
        .where(operators.eq(schema.dailyAnalytics.entityId, entityId)),
    ]);

    assert.equal(events.length, 1);
    assert.equal(events[0]?.eventType, "post_view");
    assert.equal(events[0]?.sessionHash?.length, 64);
    assert.notEqual(events[0]?.sessionHash, sessionId);
    assert.deepEqual(aggregates, [{ metric: "post_view", value: 1 }]);
    console.log("Stage 20 analytics ingest and aggregation: Passed");
  } finally {
    try {
      await database.transaction(async (transaction) => {
        await transaction
          .delete(schema.analyticsEvents)
          .where(operators.eq(schema.analyticsEvents.entityId, entityId));
        await transaction
          .delete(schema.dailyAnalytics)
          .where(operators.eq(schema.dailyAnalytics.entityId, entityId));
      });
    } finally {
      await postgresClient.end({ timeout: 5 });
    }
  }
}

void main();
