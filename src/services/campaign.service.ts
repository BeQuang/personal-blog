import { campaigns } from "@/data/campaigns";
import type { Campaign, CampaignStatus } from "@/types";
import { findBySlug, sortByDateDescending } from "@/utils/data";

export function getCampaigns(): Campaign[] {
  return sortByDateDescending(campaigns, (campaign) => campaign.startAt);
}

export function getActiveCampaigns(): Campaign[] {
  return getCampaigns().filter((campaign) => campaign.status === "active");
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
