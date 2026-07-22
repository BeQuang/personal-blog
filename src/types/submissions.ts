export type SubmissionResource = "contact" | "newsletter" | "campaign";

export type SubmissionStatus =
  | "new"
  | "read"
  | "replied"
  | "reviewing"
  | "accepted"
  | "rejected"
  | "spam"
  | "archived";

export type NewsletterStatus = "subscribed" | "unsubscribed" | "suppressed";

export interface PublicSubmissionInputBase {
  turnstileToken: string;
}

export interface ContactSubmissionInput extends PublicSubmissionInputBase {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  collaborationType: string;
  budgetRange: string;
  message: string;
}

export interface NewsletterSubscriptionInput extends PublicSubmissionInputBase {
  email: string;
}

export interface CampaignSubmissionInput extends PublicSubmissionInputBase {
  campaignSlug: string;
  fullName: string;
  email: string;
  phone: string;
  followedPlatform: string;
  socialUsername: string;
  notes: string;
}

export interface PublicSubmissionActionResult {
  success: boolean;
  message: string;
  fieldErrors?: Readonly<Record<string, readonly string[]>>;
  retryAfterSeconds?: number;
}

export interface AdminContactSubmission {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  collaborationType: string;
  budgetRange?: string;
  message: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminNewsletterSubscription {
  id: string;
  email: string;
  status: NewsletterStatus;
  subscribedAt: string;
  unsubscribedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCampaignSubmission {
  id: string;
  campaignId: string;
  campaignTitle: string;
  fullName: string;
  email: string;
  phone?: string;
  followedPlatform?: string;
  socialUsername?: string;
  notes?: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSubmissionPage<T> {
  items: readonly T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SubmissionCampaignOption {
  id: string;
  title: string;
}
