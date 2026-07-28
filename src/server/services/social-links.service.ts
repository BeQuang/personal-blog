import "server-only";

import { z } from "zod";

import { socialLinks as mockSocialLinks } from "@/data/social-links";
import { NotFoundError, ValidationError } from "@/server/errors";
import { mapSocialLinkRow } from "@/server/mappers/social-links.mapper";
import {
  adminListPageSchema,
  parseAdminListQuery,
} from "@/server/validation/admin-list.validation";
import type {
  AdminListPage,
  AdminSocialLinkListQuery,
  SocialLink,
  SocialLinkMutationInput,
} from "@/types";

import { getContentSource } from "./content-source";
import { executeRepository } from "./service-helpers";

const idSchema = z.uuid("ID không hợp lệ");
const adminSocialLinkListQuerySchema = adminListPageSchema.extend({
  query: z.string().trim().max(200).default(""),
  sortBy: z
    .enum(["createdAt", "enabled", "label", "sortOrder", "updatedAt"])
    .default("sortOrder"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
const socialLinkSchema = z
  .object({
    platform: z.enum(["facebook", "youtube", "tiktok", "instagram", "x", "threads", "zalo", "telegram", "discord", "website", "email"]),
    label: z.string().trim().min(1, "Tên hiển thị là bắt buộc").max(80),
    username: z.string().trim().max(120).nullable().optional().transform((value) => value || null),
    url: z.string().trim().min(1, "URL là bắt buộc"),
    followerCount: z.number().int().nonnegative().nullable().optional(),
    description: z.string().trim().max(300).nullable().optional().transform((value) => value || null),
    enabled: z.boolean(),
    order: z.number().int().nonnegative().max(10000),
  })
  .superRefine((value, context) => {
    if (value.platform === "email") {
      if (!/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value.url)) {
        context.addIssue({ code: "custom", path: ["url"], message: "Kênh email phải dùng URL mailto hợp lệ" });
      }
      return;
    }

    try {
      const url = new URL(value.url);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Unsupported protocol");
      }
    } catch {
      context.addIssue({ code: "custom", path: ["url"], message: "URL phải dùng http hoặc https" });
    }
  });

export async function getSocialLinks(): Promise<SocialLink[]> {
  if (getContentSource() === "mock") {
    return mockSocialLinks.map((link) => ({ ...link })).sort((a, b) => a.order - b.order);
  }
  const { findSocialLinks } = await import("@/server/repositories/social-links.repository");
  return executeRepository(async () => (await findSocialLinks()).map(mapSocialLinkRow));
}

export async function getEnabledSocialLinks(): Promise<SocialLink[]> {
  if (getContentSource() === "mock") {
    return mockSocialLinks
      .filter((link) => link.enabled)
      .map((link) => ({ ...link }))
      .sort((a, b) => a.order - b.order);
  }
  const { findEnabledSocialLinks } = await import("@/server/repositories/social-links.repository");
  return executeRepository(async () => (await findEnabledSocialLinks()).map(mapSocialLinkRow));
}

export async function getAdminSocialLinks() {
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission("settings:manage");
  const { findSocialLinks } = await import("@/server/repositories/social-links.repository");
  return executeRepository(async () => (await findSocialLinks()).map(mapSocialLinkRow));
}

export async function getAdminSocialLinkPage(
  input: unknown,
): Promise<AdminListPage<SocialLink, AdminSocialLinkListQuery["sortBy"]>> {
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission("settings:manage");
  const query = parseAdminListQuery(
    adminSocialLinkListQuerySchema,
    input,
    "Bộ lọc mạng xã hội chưa hợp lệ",
  ) as AdminSocialLinkListQuery;
  const repository = await import("@/server/repositories/social-links.repository");
  const result = await executeRepository(() => repository.findSocialLinkPage(query));
  return {
    items: result.items.map(mapSocialLinkRow),
    total: result.total,
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };
}

async function parseMutation(input: SocialLinkMutationInput) {
  const { requireServicePermission } = await import("./service-authorization");
  const currentUser = await requireServicePermission("settings:manage");
  const parsed = socialLinkSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Dữ liệu social link chưa hợp lệ", parsed.error.flatten().fieldErrors);
  }
  return {
    currentUser,
    values: {
      platform: parsed.data.platform,
      label: parsed.data.label,
      username: parsed.data.username,
      url: parsed.data.url,
      followerCount: parsed.data.followerCount ?? null,
      description: parsed.data.description,
      enabled: parsed.data.enabled,
      sortOrder: parsed.data.order,
    },
  };
}

export async function createSocialLink(input: SocialLinkMutationInput) {
  const prepared = await parseMutation(input);
  const repository = await import("@/server/repositories/social-links.repository");
  const row = await executeRepository(() => repository.createSocialLink(
    prepared.values,
    prepared.currentUser.id,
  ));
  return { id: row.id };
}

export async function updateSocialLink(id: string, input: SocialLinkMutationInput) {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) throw new ValidationError("ID social link không hợp lệ", { id: ["ID không hợp lệ"] });
  const prepared = await parseMutation(input);
  const repository = await import("@/server/repositories/social-links.repository");
  const row = await executeRepository(() => repository.updateSocialLink(
    parsedId.data,
    prepared.values,
    prepared.currentUser.id,
  ));
  if (!row) throw new NotFoundError("SocialLink", id);
  return { id: row.id };
}

export async function deleteSocialLink(id: string) {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) throw new ValidationError("ID social link không hợp lệ", { id: ["ID không hợp lệ"] });
  const { requireServicePermission } = await import("./service-authorization");
  const currentUser = await requireServicePermission("settings:manage");
  const repository = await import("@/server/repositories/social-links.repository");
  const row = await executeRepository(() => repository.deleteSocialLink(parsedId.data, currentUser.id));
  if (!row) throw new NotFoundError("SocialLink", id);
  return { id: row.id };
}

export async function setSocialLinkEnabled(id: string, enabled: boolean) {
  const parsed = z.object({ id: idSchema, enabled: z.boolean() }).safeParse({ id, enabled });
  if (!parsed.success) throw new ValidationError("Dữ liệu trạng thái chưa hợp lệ", parsed.error.flatten().fieldErrors);
  const { requireServicePermission } = await import("./service-authorization");
  const currentUser = await requireServicePermission("settings:manage");
  const repository = await import("@/server/repositories/social-links.repository");
  const row = await executeRepository(() => repository.updateSocialLink(
    parsed.data.id,
    { enabled: parsed.data.enabled },
    currentUser.id,
    "social_link.enabled.update",
  ));
  if (!row) throw new NotFoundError("SocialLink", id);
  return { id: row.id };
}

export async function prepareSocialLinkMutation(input: SocialLinkMutationInput) {
  return parseMutation(input);
}
