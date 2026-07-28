import "server-only";

import { z } from "zod";

import { postContentBlocksSchema } from "@/lib/post-content-blocks";
import { slugSchema } from "@/server/domain/content-rules";
import { ValidationError } from "@/server/errors";

const idSchema = z.uuid("ID không hợp lệ");

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
  content: postContentBlocksSchema,
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
