import type {
  campaignSubmissions,
  contactSubmissions,
  newsletterSubscriptions,
} from "@/server/database/schema";

type CampaignSubmissionRow = typeof campaignSubmissions.$inferSelect;
type ContactSubmissionRow = typeof contactSubmissions.$inferSelect;
type NewsletterSubscriptionRow = typeof newsletterSubscriptions.$inferSelect;

export interface CampaignSubmissionDto {
  id: string;
  campaignId: string;
  fullName: string;
  email: string;
  phone?: string;
  followedPlatform?: string;
  socialUsername?: string;
  notes?: string;
  status: CampaignSubmissionRow["status"];
  source?: string;
  createdAt: string;
  updatedAt: string;
}

type CampaignSubmissionMappableRow = Pick<
  CampaignSubmissionRow,
  | "id"
  | "campaignId"
  | "fullName"
  | "email"
  | "phone"
  | "followedPlatform"
  | "socialUsername"
  | "notes"
  | "status"
  | "source"
  | "createdAt"
  | "updatedAt"
>;

export type CampaignSubmissionWithTitleRow = CampaignSubmissionMappableRow & {
  campaignTitle: string;
};

export interface ContactSubmissionDto {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  collaborationType: string;
  budgetRange?: string;
  message: string;
  attachmentMediaId?: string;
  status: ContactSubmissionRow["status"];
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterSubscriptionDto {
  id: string;
  email: string;
  status: NewsletterSubscriptionRow["status"];
  source?: string;
  subscribedAt: string;
  unsubscribedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function mapCampaignSubmissionRow(
  row: CampaignSubmissionMappableRow,
): CampaignSubmissionDto {
  return {
    id: row.id,
    campaignId: row.campaignId,
    fullName: row.fullName,
    email: row.email,
    ...(row.phone ? { phone: row.phone } : {}),
    ...(row.followedPlatform ? { followedPlatform: row.followedPlatform } : {}),
    ...(row.socialUsername ? { socialUsername: row.socialUsername } : {}),
    ...(row.notes ? { notes: row.notes } : {}),
    status: row.status,
    ...(row.source ? { source: row.source } : {}),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapAdminCampaignSubmissionRow(row: CampaignSubmissionWithTitleRow) {
  return {
    ...mapCampaignSubmissionRow(row),
    campaignTitle: row.campaignTitle,
  };
}

export function mapContactSubmissionRow(row: ContactSubmissionRow): ContactSubmissionDto {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    ...(row.phone ? { phone: row.phone } : {}),
    ...(row.company ? { company: row.company } : {}),
    collaborationType: row.collaborationType,
    ...(row.budgetRange ? { budgetRange: row.budgetRange } : {}),
    message: row.message,
    ...(row.attachmentMediaId ? { attachmentMediaId: row.attachmentMediaId } : {}),
    status: row.status,
    ...(row.source ? { source: row.source } : {}),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapNewsletterSubscriptionRow(
  row: NewsletterSubscriptionRow,
): NewsletterSubscriptionDto {
  return {
    id: row.id,
    email: row.email,
    status: row.status,
    ...(row.source ? { source: row.source } : {}),
    subscribedAt: row.subscribedAt.toISOString(),
    ...(row.unsubscribedAt ? { unsubscribedAt: row.unsubscribedAt.toISOString() } : {}),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
