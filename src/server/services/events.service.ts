import "server-only";

import { z } from "zod";

import { events as mockEvents } from "@/data/events";
import { ConflictError, NotFoundError, ValidationError } from "@/server/errors";
import { mapEventRowToEventItem } from "@/server/mappers/events.mapper";
import {
  adminListPageSchema,
  parseAdminListQuery,
} from "@/server/validation/admin-list.validation";
import { httpUrlSchema } from "@/server/validation/url.validation";
import type {
  AdminEvent,
  AdminEventListQuery,
  AdminListPage,
} from "@/types";

import { getContentSource } from "./content-source";
import { assertDateRange, createSlug, executeRepository, parseSlug, slugSchema } from "./service-helpers";

const idSchema = z.uuid("ID sự kiện không hợp lệ");
const adminEventListQuerySchema = adminListPageSchema.extend({
  sortBy: z
    .enum(["contentStatus", "createdAt", "startAt", "title", "updatedAt"])
    .default("startAt"),
});
const eventMutationSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: slugSchema.optional(),
  description: z.string().trim().min(10).max(5_000),
  bannerMediaId: z.uuid("Hãy chọn banner từ Media Library"),
  type: z.enum(["livestream", "premiere", "fan-meeting", "giveaway", "workshop", "offline", "launch"]),
  eventStatus: z.enum(["upcoming", "live", "ended", "cancelled"]),
  contentStatus: z.enum(["draft", "scheduled", "published", "archived"]),
  startAt: z.coerce.date(),
  endAt: z.coerce.date().nullable().optional(),
  timezone: z.string().trim().min(1).max(100),
  location: z.string().trim().max(300).nullable().optional(),
  platform: z.string().trim().max(100).nullable().optional(),
  externalUrl: z.union([httpUrlSchema, z.literal(""), z.null()]).optional(),
  schedule: z.array(z.object({ time: z.string().trim().min(1).max(50), title: z.string().trim().min(1).max(200), description: z.string().trim().max(500).optional() })).max(30).optional(),
  featured: z.boolean(),
});

async function requirePermission(permission: "content:view" | "content:write" | "content:publish") {
  const { requireServicePermission } = await import("./service-authorization");
  return requireServicePermission(permission);
}

async function ensureBanner(mediaId: string) {
  const { findMediaAssetById } = await import("@/server/repositories/media.repository");
  const media = await executeRepository(() => findMediaAssetById(mediaId));
  if (!media || media.deletedAt || media.type !== "image" || media.status !== "ready" || media.visibility !== "public" || !media.publicUrl) {
    throw new ValidationError("Banner sự kiện không hợp lệ", { bannerMediaId: ["Hãy chọn ảnh public đang sẵn sàng"] });
  }
}

function mapAdminEvent(row: Awaited<ReturnType<typeof import("@/server/repositories/events.repository").findEvents>>[number]): AdminEvent {
  return {
    id: row.id, title: row.title, slug: row.slug, description: row.description,
    bannerMediaId: row.bannerMediaId, bannerUrl: row.bannerMedia?.publicUrl ?? null,
    type: row.type, eventStatus: row.eventStatus, contentStatus: row.contentStatus,
    startAt: row.startAt.toISOString(), endAt: row.endAt?.toISOString() ?? null,
    timezone: row.timezone, location: row.location, platform: row.platform, externalUrl: row.externalUrl,
    schedule: row.schedule, featured: row.featured,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
  };
}

async function prepareEventMutation(input: unknown, excludedId?: string) {
  const parsed = eventMutationSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError("Dữ liệu sự kiện chưa hợp lệ", parsed.error.flatten().fieldErrors);
  assertDateRange(parsed.data.startAt, parsed.data.endAt);
  const now = new Date();
  if (parsed.data.eventStatus === "upcoming" && parsed.data.startAt <= now) throw new ValidationError("Sự kiện sắp diễn ra cần thời gian bắt đầu trong tương lai", { startAt: ["Chọn thời gian trong tương lai"] });
  if (parsed.data.eventStatus === "live" && (parsed.data.startAt > now || (parsed.data.endAt && parsed.data.endAt <= now))) throw new ValidationError("Khoảng thời gian của sự kiện live phải bao gồm hiện tại");
  if (parsed.data.eventStatus === "ended" && (!parsed.data.endAt || parsed.data.endAt > now)) throw new ValidationError("Sự kiện đã kết thúc cần thời gian kết thúc trong quá khứ", { endAt: ["Chọn thời gian trong quá khứ"] });
  if (!parsed.data.location && !parsed.data.platform) throw new ValidationError("Cần nhập địa điểm hoặc nền tảng", { location: ["Nhập địa điểm hoặc nền tảng"] });
  const currentUser = await requirePermission(parsed.data.contentStatus === "published" || parsed.data.contentStatus === "scheduled" ? "content:publish" : "content:write");
  await ensureBanner(parsed.data.bannerMediaId);
  const slug = parsed.data.slug ?? createSlug(parsed.data.title);
  const repository = await import("@/server/repositories/events.repository");
  if (await executeRepository(() => repository.findConflictingEventSlug(slug, excludedId))) throw new ConflictError("Slug sự kiện đã tồn tại");
  return { currentUser, values: { ...parsed.data, slug, endAt: parsed.data.endAt ?? null, location: parsed.data.location || null, platform: parsed.data.platform || null, externalUrl: parsed.data.externalUrl || null, schedule: parsed.data.schedule ?? [] } };
}

export async function getEvents() {
  if (getContentSource() === "mock") return mockEvents.map((event) => ({ ...event })).sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
  const repository = await import("@/server/repositories/events.repository");
  return executeRepository(async () => (await repository.findPublishedEvents()).map(mapEventRowToEventItem));
}
export async function getUpcomingEvents(referenceDate: string | Date = new Date()) { const reference = new Date(referenceDate); if (Number.isNaN(reference.getTime())) throw new ValidationError("Ngày tham chiếu không hợp lệ"); return (await getEvents()).filter((event) => (event.status === "upcoming" || event.status === "live") && new Date(event.endAt ?? event.startAt) > reference).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()); }
export async function getEventsByStatus(status: (typeof mockEvents)[number]["status"]) { return (await getEvents()).filter((event) => event.status === status); }
export async function getEventsByType(type: (typeof mockEvents)[number]["type"]) { return (await getEvents()).filter((event) => event.type === type); }
export async function getEventBySlug(slug: string) { const normalized = parseSlug(slug); if (getContentSource() === "mock") return mockEvents.find((event) => event.slug === normalized); const repository = await import("@/server/repositories/events.repository"); return executeRepository(async () => { const row = await repository.findEventBySlug(normalized, true); return row ? mapEventRowToEventItem(row) : undefined; }); }
export async function requireEventBySlug(slug: string) { const event = await getEventBySlug(slug); if (!event) throw new NotFoundError("Event", slug); return event; }

export async function getAdminEvents() { await requirePermission("content:view"); const repository = await import("@/server/repositories/events.repository"); return executeRepository(async () => (await repository.findEvents()).map(mapAdminEvent)); }
export async function getAdminEventPage(
  input: unknown,
): Promise<AdminListPage<AdminEvent, AdminEventListQuery["sortBy"]>> {
  await requirePermission("content:view");
  const query = parseAdminListQuery(
    adminEventListQuerySchema,
    input,
    "Bộ lọc sự kiện chưa hợp lệ",
  ) as AdminEventListQuery;
  const repository = await import("@/server/repositories/events.repository");
  const result = await executeRepository(() => repository.findEventPage(query));
  return {
    items: result.items.map(mapAdminEvent),
    total: result.total,
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };
}
export async function createEvent(input: unknown) { const prepared = await prepareEventMutation(input); const repository = await import("@/server/repositories/events.repository"); return executeRepository(() => repository.createEvent(prepared.values, prepared.currentUser.id)); }
export async function updateEvent(id: string, input: unknown) { const parsedId = idSchema.parse(id); const prepared = await prepareEventMutation(input, parsedId); const repository = await import("@/server/repositories/events.repository"); const row = await executeRepository(() => repository.updateEvent(parsedId, prepared.values, prepared.currentUser.id)); if (!row) throw new NotFoundError("Event", parsedId); return row; }
export async function archiveEvent(id: string) { const parsedId = idSchema.parse(id); const currentUser = await requirePermission("content:publish"); const repository = await import("@/server/repositories/events.repository"); const row = await executeRepository(() => repository.archiveEvent(parsedId, currentUser.id)); if (!row) throw new NotFoundError("Event", parsedId); return row; }
