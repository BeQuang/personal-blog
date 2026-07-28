import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { ValidationError } from "@/server/errors";
import { getTaxonomyPage } from "@/server/services/taxonomies.service";

if (existsSync(".env.local")) loadEnvFile(".env.local");

async function main() {
  const { createPostAction, setPostStatusAction } = await import("@/actions/posts.actions");
  const { parsePostContentBlocksJson } = await import("@/lib/post-content-blocks");
  const { parsePostMutationInput } = await import("@/server/validation/posts.validation");

  const allBlockTypes = parsePostContentBlocksJson(JSON.stringify([
    { type: "heading", level: 2, text: "Tiêu đề" },
    { type: "paragraph", text: "Đoạn văn" },
    { type: "image", src: "/images/test.jpg", alt: "Ảnh kiểm thử" },
    { type: "quote", text: "Trích dẫn", attribution: "Tác giả" },
    { type: "list", style: "unordered", items: ["Mục thứ nhất"] },
    { type: "code", language: "typescript", code: "const valid = true;" },
    { type: "video", url: "https://www.youtube.com/watch?v=test", title: "Video" },
    {
      type: "cta",
      title: "CTA",
      description: "Mô tả CTA",
      label: "Xem thêm",
      href: "/lien-he",
    },
    { type: "divider" },
  ]));
  if (!allBlockTypes.success || allBlockTypes.data.length !== 9) {
    throw new Error("The shared content block parser did not accept all nine block types");
  }

  const invalidJson = parsePostContentBlocksJson('[{"type":"paragraph","text":""}]');
  if (invalidJson.success) {
    throw new Error("The shared content block parser accepted an invalid visual-editor payload");
  }

  const invalidJsonSyntax = parsePostContentBlocksJson(`[
    { "type": "paragraph", "text": "Thiếu dấu phẩy" }
    { "type": "divider" }
  ]`);
  if (invalidJsonSyntax.success || !invalidJsonSyntax.error.includes("dòng")) {
    throw new Error("The shared content block parser did not report a useful syntax location");
  }

  let invalidBlocksRejected = false;
  try {
    parsePostMutationInput({
    title: "Stage 15 invalid blocks",
    excerpt: "Nội dung kiểm thử phải đủ độ dài.",
    content: [{ type: "paragraph", text: "" }],
    status: "draft",
    featured: false,
    readingTime: 1,
    categoryId: randomUUID(),
    tagIds: [],
    });
  } catch (error) {
    invalidBlocksRejected = error instanceof ValidationError;
  }

  if (!invalidBlocksRejected) {
    throw new Error("Invalid content blocks were not rejected before mutation");
  }

  const unauthorizedCreate = await createPostAction({
  title: "Stage 15 unauthorized test",
  slug: `stage15-unauthorized-${randomUUID()}`,
  excerpt: "Yêu cầu không có session không được tạo bài viết.",
  content: [{ type: "paragraph", text: "Nội dung hợp lệ để đi đến permission check." }],
  status: "draft",
  featured: false,
  readingTime: 1,
  categoryId: randomUUID(),
  tagIds: [],
  });

  const unauthorizedPublish = await setPostStatusAction(randomUUID(), "published");
  if (typeof getTaxonomyPage !== "function") {
    throw new Error("Taxonomy pagination service export is unavailable");
  }
  let unauthorizedTaxonomyPage = false;
  try {
    await getTaxonomyPage({ type: "category", page: 1, pageSize: 50 });
  } catch {
    unauthorizedTaxonomyPage = true;
  }

  if (unauthorizedCreate.success || unauthorizedPublish.success || !unauthorizedTaxonomyPage) {
    throw new Error("An unauthenticated protected content operation unexpectedly succeeded");
  }

  console.log(JSON.stringify({
    contentEditorParser: "passed",
    invalidBlocks: "rejected",
    unauthorizedCreate: "denied",
    unauthorizedPublish: "denied",
    taxonomyPageOutsideRequest: "rejected",
  }));
}

void main();
