import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { profiles } from "./profiles";

export type AuditData = Record<string, unknown>;

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorProfileId: uuid("actor_profile_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    beforeData: jsonb("before_data").$type<AuditData>(),
    afterData: jsonb("after_data").$type<AuditData>(),
    requestId: text("request_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_logs_actor_created_at_idx").on(table.actorProfileId, table.createdAt.desc()),
    index("audit_logs_entity_created_at_idx").on(
      table.entityType,
      table.entityId,
      table.createdAt.desc(),
    ),
    index("audit_logs_action_created_at_idx").on(table.action, table.createdAt.desc()),
    index("audit_logs_created_at_idx").on(table.createdAt.desc()),
  ],
).enableRLS();
