import "server-only";

import { z } from "zod";

import { ValidationError } from "@/server/errors";

export const adminListPageSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export function parseAdminListQuery<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
  message = "Bộ lọc danh sách chưa hợp lệ",
): z.output<Schema> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(message, parsed.error.flatten().fieldErrors);
  }
  return parsed.data;
}
