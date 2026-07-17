import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

if (existsSync(".env.local")) {
  loadEnvFile(".env.local");
}

const config = z
  .object({
    publicKey: z.string().min(1),
    secretKey: z.string().min(1),
    supabaseUrl: z.url(),
  })
  .parse({
    publicKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    secretKey:
      process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });

const authOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
};
const admin = createClient(config.supabaseUrl, config.secretKey, authOptions);
const editor = createClient(config.supabaseUrl, config.publicKey, authOptions);
const runId = randomUUID();
const email = `stage13-editor-${runId}@example.invalid`;
const password = `Stage13-${randomUUID()}!`;
const draftSlug = `stage13-editor-draft-${runId}`;
const publishedSlug = `stage13-editor-published-${runId}`;
let userId;
let draftEventId;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

try {
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (userError || !userData.user) {
    throw new Error(`Cannot create temporary editor: ${userError?.message}`);
  }

  userId = userData.user.id;
  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    email,
    display_name: "Stage 13 RLS editor",
    role: "editor",
    status: "active",
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    throw new Error(`Cannot create temporary editor profile: ${profileError.message}`);
  }

  const { error: signInError } = await editor.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    throw new Error(`Temporary editor cannot sign in: ${signInError.message}`);
  }

  const eventBase = {
    title: "Stage 13 editor RLS test",
    description: "Temporary row used to verify editor authorization.",
    type: "workshop",
    event_status: "upcoming",
    start_at: new Date(Date.now() + 86_400_000).toISOString(),
  };
  const { data: draftEvent, error: draftError } = await editor
    .from("events")
    .insert({ ...eventBase, slug: draftSlug, content_status: "draft" })
    .select("id, content_status")
    .single();

  if (draftError || !draftEvent) {
    throw new Error(`Editor cannot create a draft: ${draftError?.message}`);
  }

  draftEventId = draftEvent.id;
  assert(draftEvent.content_status === "draft", "Draft insert returned a non-draft row");

  const { error: publishedInsertError } = await editor.from("events").insert({
    ...eventBase,
    slug: publishedSlug,
    content_status: "published",
  });
  assert(
    publishedInsertError,
    "Editor unexpectedly inserted published content through the Data API",
  );

  const { data: updateRows, error: publishUpdateError } = await editor
    .from("events")
    .update({ content_status: "published" })
    .eq("id", draftEventId)
    .select("id");
  assert(
    publishUpdateError || updateRows.length === 0,
    "Editor unexpectedly published a draft through the Data API",
  );

  const { error: deleteError } = await editor
    .from("events")
    .delete()
    .eq("id", draftEventId);
  const { data: retainedEvent, error: retainedEventError } = await admin
    .from("events")
    .select("id")
    .eq("id", draftEventId)
    .maybeSingle();
  assert(!retainedEventError, `Cannot verify retained draft: ${retainedEventError?.message}`);
  assert(
    deleteError || retainedEvent,
    "Editor unexpectedly deleted content through the Data API",
  );

  const routeTest = spawnSync(process.execPath, ["scripts/test-auth-flow.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      AUTH_TEST_PROTECTED_PATH: "/admin/settings",
      AUTH_TEST_PROTECTED_STATUS: "307",
      BOOTSTRAP_ADMIN_EMAIL: email,
      BOOTSTRAP_ADMIN_PASSWORD: password,
    },
  });

  if (routeTest.status !== 0) {
    throw new Error(
      `Editor route authorization test failed: ${routeTest.stderr || routeTest.stdout}`,
    );
  }

  console.log(
    JSON.stringify({
      draftInsert: "allowed",
      draftToPublished: "denied",
      publishedInsert: "denied",
      delete: "denied",
      settingsRoute: "denied",
    }),
  );
} finally {
  await editor.auth.signOut();

  if (draftEventId) {
    await admin.from("events").delete().eq("id", draftEventId);
  }

  await admin.from("events").delete().eq("slug", publishedSlug);

  if (userId) {
    await admin.from("profiles").delete().eq("id", userId);
    await admin.auth.admin.deleteUser(userId);
  }
}
