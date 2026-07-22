export type CampaignStatus = "draft" | "upcoming" | "active" | "ended";

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  banner: string;
  startAt: string;
  endAt: string;
  status: CampaignStatus;
  buttonLabel: string;
  buttonUrl?: string;
  rules: readonly string[];
  terms: readonly string[];
  featured: boolean;
  submissionEnabled?: boolean;
  submissionLimit?: number;
}
