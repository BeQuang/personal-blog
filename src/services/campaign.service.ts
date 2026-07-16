import { campaigns } from "@/data/campaigns";
import type { Campaign, CampaignStatus } from "@/types";
import { findBySlug, sortByDateDescending } from "@/utils/data";
import { toTimestamp } from "@/utils/date";

export function getCampaigns(): Campaign[] {
  return sortByDateDescending(campaigns, (campaign) => campaign.startAt);
}

export function getActiveCampaigns(referenceDate: string | Date = new Date()): Campaign[] {
  const referenceTimestamp = toTimestamp(referenceDate);

  return getCampaigns().filter(
    (campaign) =>
      campaign.status === "active" &&
      toTimestamp(campaign.startAt) <= referenceTimestamp &&
      toTimestamp(campaign.endAt) > referenceTimestamp,
  );
}

export function getFeaturedCampaign(): Campaign | undefined {
  return getActiveCampaigns().find((campaign) => campaign.featured);
}

export function getCampaignBySlug(slug: string): Campaign | undefined {
  return findBySlug(campaigns, slug);
}

export function getCampaignsByStatus(status: CampaignStatus): Campaign[] {
  return getCampaigns().filter((campaign) => campaign.status === status);
}
