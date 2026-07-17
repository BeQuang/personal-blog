import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

if (existsSync(".env.local")) {
  loadEnvFile(".env.local");
}

const bootstrapEnabled = process.env.BOOTSTRAP_ADMIN_ENABLED === "true";

if (!bootstrapEnabled) {
  console.log("[auth:bootstrap] Disabled; skipping initial Admin creation.");
  process.exit(0);
}

const bootstrapConfigSchema = z.object({
  displayName: z.string().trim().min(2, "BOOTSTRAP_ADMIN_DISPLAY_NAME is required"),
  email: z.email("BOOTSTRAP_ADMIN_EMAIL must be a valid email").trim(),
  password: z
    .string()
    .min(12, "BOOTSTRAP_ADMIN_PASSWORD must contain at least 12 characters"),
  secretKey: z.string().min(1, "A Supabase secret/service-role key is required"),
  supabaseUrl: z.url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
});

const parsedConfig = bootstrapConfigSchema.safeParse({
  displayName: process.env.BOOTSTRAP_ADMIN_DISPLAY_NAME,
  email: process.env.BOOTSTRAP_ADMIN_EMAIL,
  password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
  secretKey:
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
});

if (!parsedConfig.success) {
  const messages = parsedConfig.error.issues.map((issue) => issue.message).join("; ");
  throw new Error(`[auth:bootstrap] Invalid environment: ${messages}`);
}

const { displayName, email, password, secretKey, supabaseUrl } = parsedConfig.data;
const supabase = createClient(supabaseUrl, secretKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

const { data: usersData, error: usersError } =
  await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

if (usersError) {
  throw new Error(`[auth:bootstrap] Cannot inspect Auth users: ${usersError.message}`);
}

if (usersData.users.length > 0) {
  console.log("[auth:bootstrap] Auth already has a user; bootstrap skipped.");
  process.exit(0);
}

const { data: createdUserData, error: createUserError } =
  await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
    },
  });

if (createUserError || !createdUserData.user) {
  throw new Error(
    `[auth:bootstrap] Cannot create initial Admin: ${createUserError?.message ?? "Unknown error"}`,
  );
}

const now = new Date().toISOString();
const { error: profileError } = await supabase.from("profiles").upsert(
  {
    id: createdUserData.user.id,
    email,
    display_name: displayName,
    role: "super_admin",
    status: "active",
    updated_at: now,
  },
  { onConflict: "id" },
);

if (profileError) {
  const { error: rollbackError } = await supabase.auth.admin.deleteUser(
    createdUserData.user.id,
  );
  const rollbackMessage = rollbackError
    ? ` Rollback also failed: ${rollbackError.message}`
    : " The newly created Auth user was rolled back.";

  throw new Error(
    `[auth:bootstrap] Cannot create super_admin profile: ${profileError.message}.${rollbackMessage}`,
  );
}

console.log(`[auth:bootstrap] Initial super_admin created for ${email}.`);
