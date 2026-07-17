import "server-only";

import { z } from "zod";

import { slugSchema } from "@/server/domain/content-rules";
import { ValidationError } from "@/server/errors";

const idSchema = z.uuid("ID không hợp lệ");

const internalOrAbsoluteUrlSchema = z.string().trim().refine((value) => {
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}, "URL phải là đường dẫn nội bộ hoặc URL http/https hợp lệ");

const contentBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("heading"),
    level: z.union([z.literal(2), z.literal(3)]),
    text: z.string().trim().min(1, "Heading không được để trống"),
  }),
  z.object({
    type: z.literal("paragraph"),
    text: z.string().trim().min(1, "Đoạn văn không được để trống"),
  }),
  z.object({
    type: z.literal("image"),
    src: internalOrAbsoluteUrlSchema,
    alt: z.string().trim().min(1, "Ảnh trong bài phải có alt"),
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
    items: z.array(z.string().trim().min(1)).min(1, "Danh sách phải có ít nhất một mục"),
  }),
  z.object({
    type: z.literal("code"),
    language: z.string().trim().min(1),
    code: z.string().min(1, "Khối code không được để trống"),
  }),
  z.object({
    type: z.literal("video"),
    url: internalOrAbsoluteUrlSchema,
    title: z.string().trim().min(1),
  }),
  z.object({
    type: z.literal("cta"),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    label: z.string().trim().min(1),
    href: internalOrAbsoluteUrlSchema,
  }),
  z.object({ type: z.literal("divider") }),
]);

const optionalText = (maximum: number) =>
  z.string().trim().max(maximum).nullable().optional().transform((value) => value || null);

const optionalDate = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((value, context) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      context.addIssue({ code: "custom", message: "Ngày giờ không hợp lệ" });
      return z.NEVER;
    }
    return date;
  });

const postMutationSchema = z.object({
  title: z.string().trim().min(3, "Tiêu đề phải có ít nhất 3 ký tự").max(180),
  slug: z.union([slugSchema, z.literal("")]).optional(),
  excerpt: z.string().trim().min(10, "Mô tả phải có ít nhất 10 ký tự").max(500),
  content: z.array(contentBlockSchema).min(1, "Bài viết phải có ít nhất một content block"),
  status: z.enum(["draft", "scheduled", "published", "archived"]),
  featured: z.boolean(),
  readingTime: z.number().int().min(1).max(999),
  categoryId: idSchema,
  tagIds: z.array(idSchema).max(30).transform((ids) => [...new Set(ids)]),
  thumbnailMediaId: idSchema.nullable().optional(),
  coverMediaId: idSchema.nullable().optional(),
  scheduledAt: optionalDate,
  publishedAt: optionalDate,
  seoTitle: optionalText(70),
  seoDescription: optionalText(180),
});

export function parsePostMutationInput(input: unknown) {
  const parsed = postMutationSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Dữ liệu bài viết chưa hợp lệ", parsed.error.flatten().fieldErrors);
  }
  return parsed.data;
}
