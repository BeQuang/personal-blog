import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

if (existsSync(".env.local")) loadEnvFile(".env.local");

const config = z.object({
  publicKey: z.string().min(1),
  secretKey: z.string().min(1),
  supabaseUrl: z.url(),
}).parse({
  publicKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  secretKey:
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
});

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
};
const admin = createClient(config.supabaseUrl, config.secretKey, clientOptions);
const editor = createClient(config.supabaseUrl, config.publicKey, clientOptions);
const runId = randomUUID();
const email = `stage15-editor-${runId}@example.invalid`;
const password = `Stage15-${randomUUID()}!`;
const categorySlug = `stage15-authorization-category-${runId}`;
const primaryTagSlug = `stage15-authorization-tag-${runId}`;
const secondaryTagSlug = `stage15-authorization-secondary-tag-${runId}`;
const postSlug = `stage15-authorization-post-${runId}`;
let userId;
let categoryId;
let primaryTagId;
let secondaryTagId;
let postId;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function requireRow(query, label) {
  const { data, error } = await query;
  if (error || !data) throw new Error(`${label}: ${error?.message ?? "missing row"}`);
  return data;
}

try {
  const userData = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (userData.error || !userData.data.user) {
    throw new Error(`Cannot create temporary editor: ${userData.error?.message}`);
  }
  userId = userData.data.user.id;

  await requireRow(
    admin.from("profiles").upsert({
      id: userId,
      email,
      display_name: "Stage 15 authorization editor",
      role: "editor",
      status: "active",
      updated_at: new Date().toISOString(),
    }).select("id").single(),
    "Cannot create editor profile",
  );

  const category = await requireRow(
    admin.from("categories").insert({
      name: "Stage 15 authorization category",
      slug: categorySlug,
    }).select("id, name").single(),
    "Cannot create category",
  );
  categoryId = category.id;

  const primaryTag = await requireRow(
    admin.from("tags").insert({
      name: "Stage 15 authorization tag",
      slug: primaryTagSlug,
    }).select("id, name").single(),
    "Cannot create primary tag",
  );
  primaryTagId = primaryTag.id;

  const secondaryTag = await requireRow(
    admin.from("tags").insert({
      name: "Stage 15 authorization secondary tag",
      slug: secondaryTagSlug,
    }).select("id").single(),
    "Cannot create secondary tag",
  );
  secondaryTagId = secondaryTag.id;

  const { data: author, error: authorError } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "super_admin")
    .eq("status", "active")
    .neq("id", userId)
    .limit(1)
    .single();
  if (authorError || !author) throw new Error(`Cannot find author: ${authorError?.message}`);

  const post = await requireRow(
    admin.from("posts").insert({
      title: "Stage 15 authorization post",
      slug: postSlug,
      excerpt: "Temporary post used to verify Stage 15 authorization rules.",
      content: [{ type: "paragraph", text: "Temporary content." }],
      category_id: categoryId,
      author_id: author.id,
      status: "published",
      published_at: "2000-01-01T00:00:00.000Z",
      reading_time: 1,
    }).select("id").single(),
    "Cannot create published post",
  );
  postId = post.id;

  const { error: assignmentError } = await admin.from("post_tags").insert({
    post_id: postId,
    tag_id: primaryTagId,
  });
  if (assignmentError) throw new Error(`Cannot assign primary tag: ${assignmentError.message}`);

  const { error: signInError } = await editor.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(`Temporary editor cannot sign in: ${signInError.message}`);

  await editor.from("categories").update({ name: "Forbidden category edit" }).eq("id", categoryId);
  await editor.from("tags").update({ name: "Forbidden tag edit" }).eq("id", primaryTagId);
  await editor.from("post_tags").delete().eq("post_id", postId).eq("tag_id", primaryTagId);
  await editor.from("post_tags").insert({ post_id: postId, tag_id: secondaryTagId });

  const { data: protectedCategory } = await admin
    .from("categories")
    .select("name")
    .eq("id", categoryId)
    .single();
  const { data: protectedTag } = await admin
    .from("tags")
    .select("name")
    .eq("id", primaryTagId)
    .single();
  const { data: protectedAssignments, error: protectedAssignmentsError } = await admin
    .from("post_tags")
    .select("tag_id")
    .eq("post_id", postId);
  if (protectedAssignmentsError) {
    throw new Error(`Cannot verify protected assignments: ${protectedAssignmentsError.message}`);
  }
  assert(
    protectedCategory?.name === "Stage 15 authorization category",
    "Editor changed a category used by published content",
  );
  assert(
    protectedTag?.name === "Stage 15 authorization tag",
    "Editor changed a tag used by published content",
  );
  assert(
    protectedAssignments.length === 1 && protectedAssignments[0].tag_id === primaryTagId,
    "Editor changed tag assignments on published content",
  );

  const { error: draftError } = await admin
    .from("posts")
    .update({ status: "draft", published_at: null })
    .eq("id", postId);
  if (draftError) throw new Error(`Cannot return post to draft: ${draftError.message}`);

  const draftCategoryName = "Stage 15 editor draft category";
  const draftTagName = "Stage 15 editor draft tag";
  const { error: draftCategoryError } = await editor
    .from("categories")
    .update({ name: draftCategoryName })
    .eq("id", categoryId);
  const { error: draftTagError } = await editor
    .from("tags")
    .update({ name: draftTagName })
    .eq("id", primaryTagId);
  const { error: draftDeleteError } = await editor
    .from("post_tags")
    .delete()
    .eq("post_id", postId)
    .eq("tag_id", primaryTagId);
  const { error: draftInsertError } = await editor
    .from("post_tags")
    .insert({ post_id: postId, tag_id: secondaryTagId });
  assert(!draftCategoryError, `Editor cannot update a draft category: ${draftCategoryError?.message}`);
  assert(!draftTagError, `Editor cannot update a draft tag: ${draftTagError?.message}`);
  assert(!draftDeleteError, `Editor cannot remove a draft tag: ${draftDeleteError?.message}`);
  assert(!draftInsertError, `Editor cannot assign a draft tag: ${draftInsertError?.message}`);

  console.log(JSON.stringify({
    draftTaxonomyMutation: "allowed",
    publishedPostTagMutation: "denied",
    publishedTaxonomyMutation: "denied",
  }));
} finally {
  const cleanupErrors = [];
  const cleanup = async (label, operation) => {
    const { error } = await operation;
    if (error) cleanupErrors.push(`${label}: ${error.message}`);
  };

  await editor.auth.signOut();
  if (postId) await cleanup("post", admin.from("posts").delete().eq("id", postId));
  if (primaryTagId) await cleanup("primary tag", admin.from("tags").delete().eq("id", primaryTagId));
  if (secondaryTagId) await cleanup("secondary tag", admin.from("tags").delete().eq("id", secondaryTagId));
  if (categoryId) await cleanup("category", admin.from("categories").delete().eq("id", categoryId));
  if (userId) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) cleanupErrors.push(`auth user: ${error.message}`);
  }

  if (cleanupErrors.length > 0) {
    throw new Error(`Stage 15 authorization cleanup failed: ${cleanupErrors.join("; ")}`);
  }
}
