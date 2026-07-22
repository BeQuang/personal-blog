import type { Campaign } from "@/types";

import type { findPublicCampaigns } from "@/server/repositories/campaigns.repository";

import { requirePublicMediaUrl } from "./mapper-helpers";

type CampaignWithMedia = Awaited<ReturnType<typeof findPublicCampaigns>>[number];

export function mapCampaignRowToCampaign(row: CampaignWithMedia): Campaign {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    banner: requirePublicMediaUrl(row.bannerMedia, `Campaign '${row.slug}' banner`),
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    status: row.status,
    buttonLabel: row.buttonLabel,
    ...(row.buttonUrl ? { buttonUrl: row.buttonUrl } : {}),
    rules: row.rules,
    terms: row.terms,
    featured: row.featured,
    submissionEnabled: row.submissionEnabled,
    ...(row.submissionLimit ? { submissionLimit: row.submissionLimit } : {}),
  };
}
