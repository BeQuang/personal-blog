import { campaigns } from "@/data/campaigns";
import type { Campaign, CampaignStatus } from "@/types";
import { findBySlug, sortByDateDescending } from "@/utils/data";
import { toTimestamp } from "@/utils/date";

export function getCampaigns(): Campaign[] {
  return sortByDateDescending(campaigns, (campaign) => campaign.startAt);
}

export function getPublicCampaigns(): Campaign[] {
  return getCampaigns().filter((campaign) => campaign.status !== "draft");
}

export function getEffectiveCampaignStatus(
  campaign: Pick<Campaign, "status" | "startAt" | "endAt">,
  referenceDate: string | Date = new Date(),
): CampaignStatus {
  if (campaign.status === "draft") return "draft";

  const referenceTimestamp = toTimestamp(referenceDate);
  if (referenceTimestamp < toTimestamp(campaign.startAt)) return "upcoming";
  if (referenceTimestamp >= toTimestamp(campaign.endAt)) return "ended";

  return "active";
}

export function getActiveCampaigns(referenceDate: string | Date = new Date()): Campaign[] {
  return getCampaigns().filter(
    (campaign) => getEffectiveCampaignStatus(campaign, referenceDate) === "active",
  );
}

export function getFeaturedCampaign(): Campaign | undefined {
  return getActiveCampaigns().find((campaign) => campaign.featured);
}

export function getCampaignBySlug(slug: string): Campaign | undefined {
  return findBySlug(campaigns, slug);
}

export function getPublicCampaignBySlug(slug: string): Campaign | undefined {
  return findBySlug(getPublicCampaigns(), slug);
}

export function getCampaignsByStatus(status: CampaignStatus): Campaign[] {
  return getCampaigns().filter((campaign) => campaign.status === status);
}
