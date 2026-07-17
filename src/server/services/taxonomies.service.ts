import "server-only";

import { z } from "zod";

import { ConflictError, NotFoundError, ValidationError } from "@/server/errors";
import type { TaxonomyItem, TaxonomyMutationInput } from "@/types";

import { createSlug, executeRepository, parseSlug, slugSchema } from "./service-helpers";

const idSchema = z.uuid("ID không hợp lệ");
const taxonomySchema = z.object({
  name: z.string().trim().min(2, "Tên phải có ít nhất 2 ký tự").max(100),
  slug: z.union([slugSchema, z.literal("")]).optional(),
  description: z.string().trim().max(300).nullable().optional(),
});

function parseMutation(input: TaxonomyMutationInput) {
  const parsed = taxonomySchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Dữ liệu phân loại chưa hợp lệ", parsed.error.flatten().fieldErrors);
  }
  return {
    name: parsed.data.name,
    slug: parsed.data.slug ? parseSlug(parsed.data.slug) : createSlug(parsed.data.name),
    description: parsed.data.description || null,
  };
}

async function requireWritePermission() {
  const { requireServicePermission } = await import("./service-authorization");
  return requireServicePermission("content:write");
}

async function requirePublishPermission() {
  const { requireServicePermission } = await import("./service-authorization");
  return requireServicePermission("content:publish");
}

export async function getCategories(): Promise<TaxonomyItem[]> {
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission("content:view");
  const repository = await import("@/server/repositories/categories.repository");
  return executeRepository(async () =>
    (await repository.findCategories()).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      ...(row.description ? { description: row.description } : {}),
    })),
  );
}

export async function createCategory(input: TaxonomyMutationInput) {
  const currentUser = await requireWritePermission();
  const values = parseMutation(input);
  const repository = await import("@/server/repositories/categories.repository");
  if (await executeRepository(() => repository.findConflictingCategorySlug(values.slug))) {
    throw new ConflictError("Slug danh mục đã tồn tại");
  }
  const row = await executeRepository(() => repository.createCategory(values, currentUser.id));
  return { id: row.id };
}

export async function updateCategory(id: string, input: TaxonomyMutationInput) {
  const currentUser = await requireWritePermission();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) throw new ValidationError("ID danh mục không hợp lệ", { id: ["ID không hợp lệ"] });
  const values = parseMutation(input);
  const repository = await import("@/server/repositories/categories.repository");
  if (await executeRepository(() => repository.isCategoryUsedByNonDraftPost(parsedId.data))) {
    await requirePublishPermission();
  }
  if (await executeRepository(() => repository.findConflictingCategorySlug(values.slug, parsedId.data))) {
    throw new ConflictError("Slug danh mục đã tồn tại");
  }
  const row = await executeRepository(() => repository.updateCategory(parsedId.data, values, currentUser.id));
  if (!row) throw new NotFoundError("Category", id);
  return { id: row.id };
}

export async function deleteCategory(id: string) {
  const currentUser = await requireWritePermission();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) throw new ValidationError("ID danh mục không hợp lệ", { id: ["ID không hợp lệ"] });
  const repository = await import("@/server/repositories/categories.repository");
  if (await executeRepository(() => repository.isCategoryUsedByNonDraftPost(parsedId.data))) {
    await requirePublishPermission();
  }
  const row = await executeRepository(() => repository.deleteCategory(parsedId.data, currentUser.id));
  if (!row) throw new NotFoundError("Category", id);
  return { id: row.id };
}

export async function getTags(): Promise<TaxonomyItem[]> {
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission("content:view");
  const repository = await import("@/server/repositories/tags.repository");
  return executeRepository(async () =>
    (await repository.findTags()).map((row) => ({ id: row.id, name: row.name, slug: row.slug })),
  );
}

export async function createTag(input: TaxonomyMutationInput) {
  const currentUser = await requireWritePermission();
  const values = parseMutation(input);
  const repository = await import("@/server/repositories/tags.repository");
  if (await executeRepository(() => repository.findConflictingTagSlug(values.slug))) {
    throw new ConflictError("Slug thẻ đã tồn tại");
  }
  const row = await executeRepository(() => repository.createTag(
    { name: values.name, slug: values.slug },
    currentUser.id,
  ));
  return { id: row.id };
}

export async function updateTag(id: string, input: TaxonomyMutationInput) {
  const currentUser = await requireWritePermission();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) throw new ValidationError("ID thẻ không hợp lệ", { id: ["ID không hợp lệ"] });
  const values = parseMutation(input);
  const repository = await import("@/server/repositories/tags.repository");
  if (await executeRepository(() => repository.isTagUsedByNonDraftPost(parsedId.data))) {
    await requirePublishPermission();
  }
  if (await executeRepository(() => repository.findConflictingTagSlug(values.slug, parsedId.data))) {
    throw new ConflictError("Slug thẻ đã tồn tại");
  }
  const row = await executeRepository(() => repository.updateTag(
    parsedId.data,
    { name: values.name, slug: values.slug },
    currentUser.id,
  ));
  if (!row) throw new NotFoundError("Tag", id);
  return { id: row.id };
}

export async function deleteTag(id: string) {
  const currentUser = await requireWritePermission();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) throw new ValidationError("ID thẻ không hợp lệ", { id: ["ID không hợp lệ"] });
  const repository = await import("@/server/repositories/tags.repository");
  if (await executeRepository(() => repository.isTagUsedByNonDraftPost(parsedId.data))) {
    await requirePublishPermission();
  }
  const row = await executeRepository(() => repository.deleteTag(parsedId.data, currentUser.id));
  if (!row) throw new NotFoundError("Tag", id);
  return { id: row.id };
}
