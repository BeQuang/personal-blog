import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { profileStatusEnum, userRoleEnum } from "./enums";

export const profiles = pgTable(
  "profiles",
  {
    // Stage 13 will add the cross-schema FK to auth.users after Supabase Auth is configured.
    id: uuid("id").primaryKey(),
    email: text("email"),
    displayName: text("display_name").notNull(),
    role: userRoleEnum("role").notNull().default("viewer"),
    status: profileStatusEnum("status").notNull().default("active"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("profiles_role_idx").on(table.role),
    index("profiles_status_idx").on(table.status),
    index("profiles_status_role_idx").on(table.status, table.role),
  ],
).enableRLS();
