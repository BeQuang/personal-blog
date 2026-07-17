import "server-only";

import { z } from "zod";

import { ValidationError } from "@/server/errors";

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain lowercase letters, numbers and hyphens only");

export function parseSlug(value: string) {
  const parsed = slugSchema.safeParse(value);
  if (!parsed.success) {
    throw new ValidationError("Slug validation failed", {
      slug: parsed.error.issues.map((issue) => issue.message),
    });
  }
  return parsed.data;
}

export function createSlug(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d")
    .replaceAll("Đ", "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return parseSlug(slug);
}

export function assertDateRange(startAt: Date, endAt?: Date | null) {
  if (Number.isNaN(startAt.getTime()) || (endAt && Number.isNaN(endAt.getTime()))) {
    throw new ValidationError("Date values must be valid", {
      date: ["Invalid date value"],
    });
  }

  if (endAt && endAt <= startAt) {
    throw new ValidationError("End time must be after start time", {
      endAt: ["End time must be after start time"],
    });
  }
}
