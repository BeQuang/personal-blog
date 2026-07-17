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
  publicKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  secretKey: process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
});

const clientOptions = {
  auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
};
const admin = createClient(config.supabaseUrl, config.secretKey, clientOptions);
const publicClient = createClient(config.supabaseUrl, config.publicKey, clientOptions);
const runId = randomUUID();
const categorySlug = `stage15-category-${runId}`;
const updatedCategorySlug = `stage15-category-updated-${runId}`;
const tagSlug = `stage15-tag-${runId}`;
const postSlug = `stage15-post-${runId}`;
let categoryId;
let tagId;
let postId;
const socialIds = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function publicPostVisible(expected) {
  const { data, error } = await publicClient.from("posts").select("id, slug, status").eq("slug", postSlug);
  if (error) throw new Error(`Cannot check public post visibility: ${error.message}`);
  assert((data.length === 1) === expected, `Public post visibility expected ${expected}, received ${data.length}`);
}

try {
  const { data: author, error: authorError } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "super_admin")
    .eq("status", "active")
    .limit(1)
    .single();
  if (authorError || !author) throw new Error(`Cannot find seed author: ${authorError?.message}`);

  const { data: category, error: categoryError } = await admin
    .from("categories")
    .insert({ name: "Stage 15 category", slug: categorySlug })
    .select("id")
    .single();
  if (categoryError || !category) throw new Error(`Cannot create category: ${categoryError?.message}`);
  categoryId = category.id;

  const { data: tag, error: tagError } = await admin
    .from("tags")
    .insert({ name: "Stage 15 tag", slug: tagSlug })
    .select("id")
    .single();
  if (tagError || !tag) throw new Error(`Cannot create tag: ${tagError?.message}`);
  tagId = tag.id;

  const { data: post, error: postError } = await admin
    .from("posts")
    .insert({
      title: "Stage 15 draft",
      slug: postSlug,
      excerpt: "Temporary Stage 15 CRUD verification post.",
      content: [{ type: "paragraph", text: "Temporary content." }],
      category_id: categoryId,
      author_id: author.id,
      status: "draft",
      reading_time: 1,
    })
    .select("id")
    .single();
  if (postError || !post) throw new Error(`Cannot create post: ${postError?.message}`);
  postId = post.id;

  const { error: postTagError } = await admin.from("post_tags").insert({ post_id: postId, tag_id: tagId });
  if (postTagError) throw new Error(`Cannot assign tag: ${postTagError.message}`);
  await publicPostVisible(false);

  const { error: editError } = await admin
    .from("posts")
    .update({ title: "Stage 15 edited", featured: true })
    .eq("id", postId);
  if (editError) throw new Error(`Cannot edit post: ${editError.message}`);

  const { error: categoryUpdateError } = await admin
    .from("categories")
    .update({ name: "Stage 15 category updated", slug: updatedCategorySlug })
    .eq("id", categoryId);
  if (categoryUpdateError) throw new Error(`Cannot update category: ${categoryUpdateError.message}`);

  const { error: referencedCategoryDeleteError } = await admin.from("categories").delete().eq("id", categoryId);
  assert(referencedCategoryDeleteError, "Referenced category was unexpectedly deleted");

  const { error: publishError } = await admin
    .from("posts")
    .update({ status: "published", published_at: "2000-01-01T00:00:00.000Z" })
    .eq("id", postId);
  if (publishError) throw new Error(`Cannot publish post: ${publishError.message}`);
  await publicPostVisible(true);

  const { error: duplicateError } = await admin.from("posts").insert({
    title: "Duplicate slug",
    slug: postSlug,
    excerpt: "This insert must fail because the slug already exists.",
    content: [{ type: "paragraph", text: "Duplicate." }],
    category_id: categoryId,
    author_id: author.id,
    status: "draft",
    reading_time: 1,
  });
  assert(duplicateError?.code === "23505", "Duplicate post slug was not rejected by PostgreSQL");

  const { error: unpublishError } = await admin
    .from("posts")
    .update({ status: "draft", published_at: null })
    .eq("id", postId);
  if (unpublishError) throw new Error(`Cannot unpublish post: ${unpublishError.message}`);
  await publicPostVisible(false);

  const { error: scheduleError } = await admin
    .from("posts")
    .update({ status: "scheduled", scheduled_at: new Date(Date.now() + 86_400_000).toISOString() })
    .eq("id", postId);
  if (scheduleError) throw new Error(`Cannot schedule post: ${scheduleError.message}`);
  await publicPostVisible(false);

  for (const [index, enabled] of [[1, true], [2, true]]) {
    const { data: social, error: socialError } = await admin
      .from("social_links")
      .insert({
        platform: "website",
        label: `Stage 15 social ${index}`,
        url: `https://example.com/stage15/${runId}/${index}`,
        enabled,
        sort_order: 9000 + index,
      })
      .select("id")
      .single();
    if (socialError || !social) throw new Error(`Cannot create social link: ${socialError?.message}`);
    socialIds.push(social.id);
  }

  const { data: publicSocial, error: publicSocialError } = await publicClient
    .from("social_links")
    .select("id, sort_order")
    .in("id", socialIds)
    .order("sort_order", { ascending: true });
  if (publicSocialError) throw new Error(`Cannot read public social links: ${publicSocialError.message}`);
  assert(publicSocial.length === 2, "Enabled social links are not publicly visible");
  assert(publicSocial[0].sort_order < publicSocial[1].sort_order, "Social order is incorrect");

  const { error: disableError } = await admin.from("social_links").update({ enabled: false }).eq("id", socialIds[0]);
  if (disableError) throw new Error(`Cannot disable social link: ${disableError.message}`);
  const { data: disabledRows, error: disabledReadError } = await publicClient
    .from("social_links")
    .select("id")
    .eq("id", socialIds[0]);
  if (disabledReadError) throw new Error(`Cannot verify disabled social link: ${disabledReadError.message}`);
  assert(disabledRows.length === 0, "Disabled social link remains publicly visible");

  console.log(JSON.stringify({
    categoryCrud: "passed",
    duplicateSlug: "rejected",
    postCreateEditPublishUnpublishSchedule: "passed",
    publicVisibility: "passed",
    socialCrudVisibilityOrder: "passed",
    tagCrud: "passed",
  }));
} finally {
  if (postId) await admin.from("posts").delete().eq("id", postId);
  if (socialIds.length > 0) await admin.from("social_links").delete().in("id", socialIds);
  if (tagId) await admin.from("tags").delete().eq("id", tagId);
  if (categoryId) await admin.from("categories").delete().eq("id", categoryId);
}
