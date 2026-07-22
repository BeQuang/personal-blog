import "server-only";

import { z } from "zod";

import { campaigns as mockCampaigns } from "@/data/campaigns";
import { ConflictError, NotFoundError, ValidationError } from "@/server/errors";
import { mapCampaignRowToCampaign } from "@/server/mappers/campaigns.mapper";
import type { AdminCampaign, Campaign, CampaignStatus } from "@/types";

import { getContentSource } from "./content-source";
import { assertDateRange, createSlug, executeRepository, parseSlug, slugSchema } from "./service-helpers";

const idSchema = z.uuid("ID chiến dịch không hợp lệ");
const campaignMutationSchema = z.object({
  title: z.string().trim().min(3).max(180), slug: slugSchema.optional(),
  description: z.string().trim().min(10).max(5_000), bannerMediaId: z.uuid("Hãy chọn banner từ Media Library"),
  startAt: z.coerce.date(), endAt: z.coerce.date(), status: z.enum(["draft", "upcoming", "active", "ended"]),
  buttonLabel: z.string().trim().min(1).max(100), buttonUrl: z.string().trim().max(500).nullable().optional(),
  rules: z.array(z.string().trim().min(1).max(500)).min(1).max(50), terms: z.array(z.string().trim().min(1).max(500)).min(1).max(50),
  featured: z.boolean(), submissionEnabled: z.boolean(), submissionLimit: z.coerce.number().int().positive().max(1_000_000).nullable().optional(),
});

async function requirePermission(permission: "content:view" | "content:write" | "content:publish") { const { requireServicePermission } = await import("./service-authorization"); return requireServicePermission(permission); }
async function ensureBanner(mediaId: string) { const { findMediaAssetById } = await import("@/server/repositories/media.repository"); const media = await executeRepository(() => findMediaAssetById(mediaId)); if (!media || media.deletedAt || media.type !== "image" || media.status !== "ready" || media.visibility !== "public" || !media.publicUrl) throw new ValidationError("Banner chiến dịch không hợp lệ", { bannerMediaId: ["Hãy chọn ảnh public đang sẵn sàng"] }); }

function mapAdminCampaign(row: Awaited<ReturnType<typeof import("@/server/repositories/campaigns.repository").findCampaigns>>[number]): AdminCampaign {
  return { id: row.id, title: row.title, slug: row.slug, description: row.description, bannerMediaId: row.bannerMediaId, bannerUrl: row.bannerMedia?.publicUrl ?? null, startAt: row.startAt.toISOString(), endAt: row.endAt.toISOString(), status: row.status, buttonLabel: row.buttonLabel, buttonUrl: row.buttonUrl, rules: row.rules, terms: row.terms, featured: row.featured, submissionEnabled: row.submissionEnabled, submissionLimit: row.submissionLimit, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}

async function prepareCampaignMutation(input: unknown, excludedId?: string) {
  const parsed = campaignMutationSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError("Dữ liệu chiến dịch chưa hợp lệ", parsed.error.flatten().fieldErrors);
  assertDateRange(parsed.data.startAt, parsed.data.endAt);
  const now = new Date();
  if (parsed.data.status === "upcoming" && parsed.data.startAt <= now) throw new ValidationError("Chiến dịch upcoming cần bắt đầu trong tương lai", { startAt: ["Chọn thời gian trong tương lai"] });
  if (parsed.data.status === "active" && (parsed.data.startAt > now || parsed.data.endAt <= now)) throw new ValidationError("Thời gian chiến dịch active phải bao gồm hiện tại");
  if (parsed.data.status === "ended" && parsed.data.endAt > now) throw new ValidationError("Chiến dịch ended cần kết thúc trong quá khứ", { endAt: ["Chọn thời gian trong quá khứ"] });
  const currentUser = await requirePermission(parsed.data.status === "draft" ? "content:write" : "content:publish");
  await ensureBanner(parsed.data.bannerMediaId);
  const slug = parsed.data.slug ?? createSlug(parsed.data.title);
  const repository = await import("@/server/repositories/campaigns.repository");
  if (await executeRepository(() => repository.findConflictingCampaignSlug(slug, excludedId))) throw new ConflictError("Slug chiến dịch đã tồn tại");
  return { currentUser, values: { ...parsed.data, slug, buttonUrl: parsed.data.buttonUrl || null, submissionLimit: parsed.data.submissionEnabled ? parsed.data.submissionLimit ?? null : null } };
}

export function getEffectiveCampaignStatus(campaign: Pick<Campaign, "status" | "startAt" | "endAt">, referenceDate: string | Date = new Date()): CampaignStatus { if (campaign.status === "draft") return "draft"; const start = new Date(campaign.startAt); const end = new Date(campaign.endAt); const reference = new Date(referenceDate); if ([start, end, reference].some((date) => Number.isNaN(date.getTime()))) throw new ValidationError("Ngày chiến dịch không hợp lệ"); if (reference < start) return "upcoming"; if (reference >= end) return "ended"; return "active"; }
export async function getCampaigns(): Promise<Campaign[]> { if (getContentSource() === "mock") return mockCampaigns.map((item) => ({ ...item })).sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()); const repository = await import("@/server/repositories/campaigns.repository"); return executeRepository(async () => (await repository.findCampaigns()).map(mapCampaignRowToCampaign)); }
export async function getPublicCampaigns(): Promise<Campaign[]> { return (await getCampaigns()).filter((item) => item.status !== "draft"); }
export async function getActiveCampaigns(referenceDate: string | Date = new Date()) { return (await getPublicCampaigns()).filter((item) => getEffectiveCampaignStatus(item, referenceDate) === "active"); }
export async function getFeaturedCampaign() { return (await getActiveCampaigns()).find((item) => item.featured); }
export async function getCampaignBySlug(slug: string): Promise<Campaign | undefined> { const normalized = parseSlug(slug); if (getContentSource() === "mock") return mockCampaigns.find((item) => item.slug === normalized); const repository = await import("@/server/repositories/campaigns.repository"); return executeRepository(async () => { const row = await repository.findCampaignBySlug(normalized); return row ? mapCampaignRowToCampaign(row) : undefined; }); }
export async function getPublicCampaignBySlug(slug: string) { const campaign = await getCampaignBySlug(slug); return campaign?.status === "draft" ? undefined : campaign; }
export async function getCampaignsByStatus(status: CampaignStatus) { return (await getPublicCampaigns()).filter((item) => item.status === status); }
export async function requireCampaignBySlug(slug: string) { const item = await getCampaignBySlug(slug); if (!item) throw new NotFoundError("Campaign", slug); return item; }

export async function getAdminCampaigns() { await requirePermission("content:view"); const repository = await import("@/server/repositories/campaigns.repository"); return executeRepository(async () => (await repository.findCampaigns()).map(mapAdminCampaign)); }
export async function createCampaign(input: unknown) { const prepared = await prepareCampaignMutation(input); const repository = await import("@/server/repositories/campaigns.repository"); return executeRepository(() => repository.createCampaign(prepared.values, prepared.currentUser.id)); }
export async function updateCampaign(id: string, input: unknown) { const parsedId = idSchema.parse(id); const prepared = await prepareCampaignMutation(input, parsedId); const repository = await import("@/server/repositories/campaigns.repository"); const row = await executeRepository(() => repository.updateCampaign(parsedId, prepared.values, prepared.currentUser.id)); if (!row) throw new NotFoundError("Campaign", parsedId); return row; }
export async function archiveCampaign(id: string) { const parsedId = idSchema.parse(id); const currentUser = await requirePermission("content:publish"); const repository = await import("@/server/repositories/campaigns.repository"); const row = await executeRepository(() => repository.archiveCampaign(parsedId, currentUser.id)); if (!row) throw new NotFoundError("Campaign", parsedId); return row; }
