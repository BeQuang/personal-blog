import "server-only";

import { z } from "zod";

import { campaigns as mockCampaigns } from "@/data/campaigns";
import { NotFoundError, ValidationError } from "@/server/errors";
import { mapCampaignRowToCampaign } from "@/server/mappers/campaigns.mapper";
import type { Campaign, CampaignStatus } from "@/types";

import { getContentSource } from "./content-source";
import {
  assertDateRange,
  createSlug,
  executeRepository,
  parseSlug,
  slugSchema,
} from "./service-helpers";

const campaignMutationSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: slugSchema.optional(),
  description: z.string().trim().min(10).max(2_000),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  status: z.enum(["draft", "upcoming", "active", "ended"]),
  buttonLabel: z.string().trim().min(1).max(100),
  buttonUrl: z.string().trim().min(1).optional(),
  rules: z.array(z.string().trim().min(1)).min(1),
  terms: z.array(z.string().trim().min(1)).min(1),
});

export function getEffectiveCampaignStatus(
  campaign: Pick<Campaign, "status" | "startAt" | "endAt">,
  referenceDate: string | Date = new Date(),
): CampaignStatus {
  if (campaign.status === "draft") return "draft";
  const startAt = new Date(campaign.startAt);
  const endAt = new Date(campaign.endAt);
  const reference = new Date(referenceDate);
  if ([startAt, endAt, reference].some((date) => Number.isNaN(date.getTime()))) {
    throw new ValidationError("Campaign dates are invalid");
  }
  if (reference < startAt) return "upcoming";
  if (reference >= endAt) return "ended";
  return "active";
}

export async function getCampaigns() {
  if (getContentSource() === "mock") {
    return mockCampaigns
      .map((campaign) => ({ ...campaign }))
      .sort(
        (left, right) =>
          new Date(right.startAt).getTime() - new Date(left.startAt).getTime(),
      );
  }

  const { findCampaigns } = await import("@/server/repositories/campaigns.repository");
  return executeRepository(async () => (await findCampaigns()).map(mapCampaignRowToCampaign));
}

export async function getPublicCampaigns() {
  return (await getCampaigns()).filter((campaign) => campaign.status !== "draft");
}

export async function getActiveCampaigns(referenceDate: string | Date = new Date()) {
  return (await getCampaigns()).filter(
    (campaign) => getEffectiveCampaignStatus(campaign, referenceDate) === "active",
  );
}

export async function getFeaturedCampaign() {
  return (await getActiveCampaigns()).find((campaign) => campaign.featured);
}

export async function getCampaignBySlug(slug: string) {
  const normalizedSlug = parseSlug(slug);
  if (getContentSource() === "mock") return mockCampaigns.find((campaign) => campaign.slug === normalizedSlug);

  const { findCampaignBySlug } = await import("@/server/repositories/campaigns.repository");
  return executeRepository(async () => {
    const row = await findCampaignBySlug(normalizedSlug);
    return row ? mapCampaignRowToCampaign(row) : undefined;
  });
}

export async function getPublicCampaignBySlug(slug: string) {
  const campaign = await getCampaignBySlug(slug);
  return campaign?.status === "draft" ? undefined : campaign;
}

export async function getCampaignsByStatus(status: CampaignStatus) {
  return (await getCampaigns()).filter((campaign) => campaign.status === status);
}

export async function requireCampaignBySlug(slug: string) {
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) throw new NotFoundError("Campaign", slug);
  return campaign;
}

export async function prepareCampaignMutation(input: unknown) {
  const parsed = campaignMutationSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Campaign validation failed", parsed.error.flatten().fieldErrors);
  }
  assertDateRange(parsed.data.startAt, parsed.data.endAt);
  const now = new Date();
  if (parsed.data.status === "upcoming" && parsed.data.startAt <= now) {
    throw new ValidationError("Upcoming campaigns require a future start time");
  }
  if (parsed.data.status === "active" && (parsed.data.startAt > now || parsed.data.endAt <= now)) {
    throw new ValidationError("Active campaign dates must include the current time");
  }
  if (parsed.data.status === "ended" && parsed.data.endAt > now) {
    throw new ValidationError("Ended campaigns require an end time in the past");
  }
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission(
    parsed.data.status === "draft" ? "content:write" : "content:publish",
  );
  return { ...parsed.data, slug: parsed.data.slug ?? createSlug(parsed.data.title) };
}
