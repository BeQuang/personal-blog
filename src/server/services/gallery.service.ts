import "server-only";

import { z } from "zod";

import { galleryItems as mockGalleryItems } from "@/data/gallery";
import { NotFoundError, ValidationError } from "@/server/errors";
import { mapGalleryRowToGalleryItem } from "@/server/mappers/gallery.mapper";
import {
  adminListPageSchema,
  parseAdminListQuery,
} from "@/server/validation/admin-list.validation";
import type {
  AdminGalleryItem,
  AdminGalleryListQuery,
  AdminListPage,
} from "@/types";

import { getContentSource } from "./content-source";
import { executeRepository } from "./service-helpers";

const idSchema = z.uuid("ID không hợp lệ");
const adminGalleryListQuerySchema = adminListPageSchema.extend({
  sortBy: z
    .enum(["createdAt", "publishedAt", "sortOrder", "status", "title", "updatedAt"])
    .default("sortOrder"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  query: z.string().trim().max(100).default(""),
  category: z.string().trim().max(100).default("all"),
});
const galleryMutationSchema = z.object({
  mediaAssetId: z.uuid("Hãy chọn ảnh từ Media Library"),
  title: z.string().trim().min(2, "Tiêu đề có ít nhất 2 ký tự").max(180),
  caption: z.string().trim().max(500).nullable().optional(),
  category: z.string().trim().min(1, "Danh mục là bắt buộc").max(100),
  alt: z.string().trim().min(3, "Alt có ít nhất 3 ký tự").max(300),
  sortOrder: z.coerce.number().int().min(0).max(100_000),
  status: z.enum(["draft", "scheduled", "published", "archived"]),
  publishedAt: z.coerce.date().nullable().optional(),
});

async function requirePermission(permission: "content:publish" | "media:manage") {
  const { requireServicePermission } = await import("./service-authorization");
  return requireServicePermission(permission);
}

async function ensureGalleryMedia(mediaAssetId: string) {
  const { findMediaAssetById } = await import("@/server/repositories/media.repository");
  const media = await executeRepository(() => findMediaAssetById(mediaAssetId));
  if (!media || media.deletedAt || media.type !== "image" || media.status !== "ready" || media.visibility !== "public" || !media.publicUrl) {
    throw new ValidationError("Ảnh đã chọn không thể dùng cho Gallery", {
      mediaAssetId: ["Hãy chọn ảnh public đang sẵn sàng trong Media Library"],
    });
  }
  return media;
}

function mapAdminGallery(row: Awaited<ReturnType<typeof import("@/server/repositories/gallery.repository").findGalleryItems>>[number]): AdminGalleryItem {
  return {
    id: row.id,
    mediaAssetId: row.mediaAssetId,
    imageUrl: row.mediaAsset.publicUrl ?? "",
    title: row.title,
    caption: row.description,
    category: row.category,
    alt: row.alt,
    sortOrder: row.sortOrder,
    status: row.status,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function prepareGalleryMutation(input: unknown) {
  const parsed = galleryMutationSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError("Dữ liệu Gallery chưa hợp lệ", parsed.error.flatten().fieldErrors);
  const currentUser = await requirePermission(parsed.data.status === "published" || parsed.data.status === "scheduled" ? "content:publish" : "media:manage");
  await ensureGalleryMedia(parsed.data.mediaAssetId);
  const now = new Date();
  let publishedAt = parsed.data.publishedAt ?? null;
  if (parsed.data.status === "published") publishedAt ??= now;
  if (parsed.data.status === "published" && publishedAt && publishedAt > now) {
    throw new ValidationError("Ảnh xuất bản ngay không thể có thời điểm trong tương lai", { publishedAt: ["Dùng trạng thái lên lịch cho thời điểm trong tương lai"] });
  }
  if (parsed.data.status === "scheduled" && (!publishedAt || publishedAt <= now)) {
    throw new ValidationError("Ảnh lên lịch cần thời điểm xuất bản trong tương lai", { publishedAt: ["Chọn thời điểm trong tương lai"] });
  }
  if (parsed.data.status !== "published" && parsed.data.status !== "scheduled") publishedAt = null;
  return { currentUser, values: { mediaAssetId: parsed.data.mediaAssetId, title: parsed.data.title, description: parsed.data.caption || null, category: parsed.data.category, alt: parsed.data.alt, sortOrder: parsed.data.sortOrder, status: parsed.data.status, publishedAt } };
}

export async function getGalleryItems() {
  if (getContentSource() === "mock") return mockGalleryItems.map((item) => ({ ...item })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const repository = await import("@/server/repositories/gallery.repository");
  return executeRepository(async () => (await repository.findPublishedGalleryItems()).map(mapGalleryRowToGalleryItem));
}

export async function getGalleryItemsByCategory(category: string) {
  const normalized = category.trim().toLocaleLowerCase("vi-VN");
  return (await getGalleryItems()).filter((item) => item.category.toLocaleLowerCase("vi-VN") === normalized);
}

export async function getGalleryPreview(limit = 8) { return (await getGalleryItems()).slice(0, Math.max(0, limit)); }

export async function getAdminGalleryItems() {
  await requirePermission("media:manage");
  const repository = await import("@/server/repositories/gallery.repository");
  return executeRepository(async () => (await repository.findGalleryItems()).map(mapAdminGallery));
}

export async function getAdminGalleryItemPage(
  input: unknown,
): Promise<AdminListPage<AdminGalleryItem, AdminGalleryListQuery["sortBy"]>> {
  await requirePermission("media:manage");
  const query = parseAdminListQuery(
    adminGalleryListQuerySchema,
    input,
    "Bộ lọc Gallery chưa hợp lệ",
  ) as AdminGalleryListQuery;
  const repository = await import("@/server/repositories/gallery.repository");
  const result = await executeRepository(() => repository.findGalleryItemPage(query));
  return {
    items: result.items.map(mapAdminGallery),
    total: result.total,
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };
}

export async function getAdminGalleryCategories() {
  await requirePermission("media:manage");
  const repository = await import("@/server/repositories/gallery.repository");
  return executeRepository(async () =>
    (await repository.findGalleryCategories()).map((row) => row.category));
}

export async function createGalleryItem(input: unknown) {
  const prepared = await prepareGalleryMutation(input);
  const repository = await import("@/server/repositories/gallery.repository");
  return executeRepository(() => repository.createGalleryItem(prepared.values, prepared.currentUser.id));
}

export async function updateGalleryItem(id: string, input: unknown) {
  const parsedId = idSchema.parse(id);
  const prepared = await prepareGalleryMutation(input);
  const repository = await import("@/server/repositories/gallery.repository");
  const row = await executeRepository(() => repository.updateGalleryItem(parsedId, prepared.values, prepared.currentUser.id));
  if (!row) throw new NotFoundError("Gallery item", parsedId);
  return row;
}

export async function deleteGalleryItem(id: string) {
  const parsedId = idSchema.parse(id);
  let currentUser = await requirePermission("media:manage");
  const repository = await import("@/server/repositories/gallery.repository");
  const existing = await executeRepository(() => repository.findGalleryItemById(parsedId));
  if (!existing || existing.deletedAt) throw new NotFoundError("Gallery item", parsedId);
  if (existing.status === "published" || existing.status === "scheduled") {
    currentUser = await requirePermission("content:publish");
  }
  const row = await executeRepository(() => repository.softDeleteGalleryItem(parsedId, currentUser.id));
  if (!row) throw new NotFoundError("Gallery item", parsedId);
  return row;
}
