import { z } from "zod";

import { internalOrHttpUrlSchema } from "@/lib/url-schema";
import type { PostContentBlock } from "@/types";

export const postContentBlockTypes = [
  "heading",
  "paragraph",
  "image",
  "quote",
  "list",
  "code",
  "video",
  "cta",
  "divider",
] as const;

export type PostContentBlockType = (typeof postContentBlockTypes)[number];

export const postContentBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("heading"),
    level: z.union([z.literal(2), z.literal(3)]),
    text: z.string().trim().min(1, "Nội dung tiêu đề không được để trống"),
  }),
  z.object({
    type: z.literal("paragraph"),
    text: z.string().trim().min(1, "Đoạn văn không được để trống"),
  }),
  z.object({
    type: z.literal("image"),
    src: internalOrHttpUrlSchema,
    alt: z.string().trim().min(1, "Ảnh trong bài phải có mô tả thay thế"),
    caption: z.string().trim().optional(),
  }),
  z.object({
    type: z.literal("quote"),
    text: z.string().trim().min(1, "Trích dẫn không được để trống"),
    attribution: z.string().trim().optional(),
  }),
  z.object({
    type: z.literal("list"),
    style: z.enum(["ordered", "unordered"]),
    items: z
      .array(z.string().trim().min(1, "Mục trong danh sách không được để trống"))
      .min(1, "Danh sách phải có ít nhất một mục"),
  }),
  z.object({
    type: z.literal("code"),
    language: z.string().trim().min(1, "Vui lòng nhập ngôn ngữ"),
    code: z.string().min(1, "Khối code không được để trống"),
  }),
  z.object({
    type: z.literal("video"),
    url: internalOrHttpUrlSchema,
    title: z.string().trim().min(1, "Video phải có tiêu đề"),
  }),
  z.object({
    type: z.literal("cta"),
    title: z.string().trim().min(1, "CTA phải có tiêu đề"),
    description: z.string().trim().min(1, "CTA phải có mô tả"),
    label: z.string().trim().min(1, "CTA phải có nhãn nút"),
    href: internalOrHttpUrlSchema,
  }),
  z.object({ type: z.literal("divider") }),
]);

export const postContentBlocksSchema = z
  .array(postContentBlockSchema)
  .min(1, "Bài viết phải có ít nhất một content block");

export interface PostContentBlocksParseSuccess {
  success: true;
  data: PostContentBlock[];
}

export interface PostContentBlocksParseFailure {
  success: false;
  error: string;
}

export type PostContentBlocksParseResult =
  | PostContentBlocksParseSuccess
  | PostContentBlocksParseFailure;

export function createPostContentBlock(type: PostContentBlockType): PostContentBlock {
  switch (type) {
    case "heading":
      return { type, level: 2, text: "" };
    case "paragraph":
      return { type, text: "" };
    case "image":
      return { type, src: "", alt: "", caption: "" };
    case "quote":
      return { type, text: "", attribution: "" };
    case "list":
      return { type, style: "unordered", items: [""] };
    case "code":
      return { type, language: "text", code: "" };
    case "video":
      return { type, url: "", title: "" };
    case "cta":
      return { type, title: "", description: "", label: "", href: "" };
    case "divider":
      return { type };
  }
}

export function clonePostContentBlock(block: PostContentBlock): PostContentBlock {
  return block.type === "list"
    ? { ...block, items: [...block.items] }
    : { ...block };
}

function formatValidationError(error: z.ZodError) {
  const issue = error.issues[0];
  if (!issue) return "Dữ liệu content blocks chưa hợp lệ.";

  const blockIndex = typeof issue.path[0] === "number" ? issue.path[0] : null;
  const prefix = blockIndex === null ? "" : `Khối ${blockIndex + 1}: `;
  if (issue.path.at(-1) === "type") {
    return `${prefix}loại block không được hỗ trợ.`;
  }
  return `${prefix}${issue.message}`;
}

export function validatePostContentBlocks(input: unknown): PostContentBlocksParseResult {
  const parsed = postContentBlocksSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatValidationError(parsed.error) };
  }
  return { success: true, data: parsed.data };
}

function getJsonSyntaxLocation(value: string, error: unknown) {
  if (!(error instanceof SyntaxError)) return null;

  const lineColumnMatch = error.message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColumnMatch) {
    return {
      line: Number(lineColumnMatch[1]),
      column: Number(lineColumnMatch[2]),
    };
  }

  const positionMatch = error.message.match(/position\s+(\d+)/i);
  if (positionMatch) {
    const position = Math.min(Number(positionMatch[1]), value.length);
    const beforeError = value.slice(0, position);
    const lastLineBreak = beforeError.lastIndexOf("\n");
    return {
      line: beforeError.split("\n").length,
      column: position - lastLineBreak,
    };
  }

  if (value.trim().length === 0) {
    return { line: 1, column: 1 };
  }

  return null;
}

export function parsePostContentBlocksJson(value: string): PostContentBlocksParseResult {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(value);
  } catch (error) {
    const location = getJsonSyntaxLocation(value, error);
    const locationMessage = location
      ? ` tại dòng ${location.line}, cột ${location.column}`
      : "";
    return {
      success: false,
      error: `JSON sai cú pháp${locationMessage}. Hãy kiểm tra dấu ngoặc, dấu phẩy và dấu nháy kép.`,
    };
  }

  if (!Array.isArray(parsedJson)) {
    return { success: false, error: "Content blocks phải là một JSON array." };
  }

  return validatePostContentBlocks(parsedJson);
}
