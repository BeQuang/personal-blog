import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { ValidationError } from "@/server/errors";

if (existsSync(".env.local")) loadEnvFile(".env.local");

async function main() {
  const { createPostAction, setPostStatusAction } = await import("@/actions/posts.actions");
  const { parsePostMutationInput } = await import("@/server/validation/posts.validation");

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

  if (unauthorizedCreate.success || unauthorizedPublish.success) {
    throw new Error("An unauthenticated Server Action unexpectedly succeeded");
  }

  console.log(JSON.stringify({
    invalidBlocks: "rejected",
    unauthorizedCreate: "denied",
    unauthorizedPublish: "denied",
  }));
}

void main();
