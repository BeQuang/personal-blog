import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

import { profileStatusEnum, userRoleEnum } from "./enums";

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
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
