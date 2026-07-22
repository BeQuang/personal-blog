import type { Metadata } from "next";

import { AdminSubmissionsManager } from "@/components/admin/AdminSubmissionsManager";
import { hasPermission, requireAdminPagePermission } from "@/server/auth";
import {
  campaignSubmissionStatuses,
  contactSubmissionStatuses,
  getCampaignSubmissionPage,
  getContactSubmissionPage,
  getNewsletterSubscriptionPage,
  getSubmissionCampaignOptions,
  newsletterSubscriptionStatuses,
} from "@/server/services/submissions.service";
import type {
  AdminCampaignSubmission,
  AdminContactSubmission,
  AdminNewsletterSubscription,
  SubmissionResource,
} from "@/types";

export const metadata: Metadata = { title: "Hộp thư và đăng ký" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | undefined) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 1
    ? Math.min(parsed, 100_000)
    : 1;
}

export default async function AdminSubmissionsPage({ searchParams }: PageProps) {
  const currentUser = await requireAdminPagePermission("submissions:view");
  const params = await searchParams;
  const rawResource = first(params.resource);
  const resource: SubmissionResource =
    rawResource === "newsletter" || rawResource === "campaign" ? rawResource : "contact";
  const query = first(params.query)?.trim().slice(0, 200) ?? "";
  const rawStatus = first(params.status)?.trim() ?? "";
  const allowedStatuses: readonly string[] = resource === "contact"
    ? contactSubmissionStatuses
    : resource === "newsletter"
      ? newsletterSubscriptionStatuses
      : campaignSubmissionStatuses;
  const status = allowedStatuses.includes(rawStatus) ? rawStatus : "";
  const rawCampaignId = first(params.campaignId)?.trim() ?? "";
  const campaignId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawCampaignId)
    ? rawCampaignId
    : "";
  const page = parsePage(first(params.page));
  const pageSize = 20;
  const listQuery = {
    page,
    pageSize,
    query: query || undefined,
    status: status || undefined,
    campaignId: campaignId || undefined,
  };

  const campaignOptions = await getSubmissionCampaignOptions();
  let contactItems: readonly AdminContactSubmission[] = [];
  let newsletterItems: readonly AdminNewsletterSubscription[] = [];
  let campaignItems: readonly AdminCampaignSubmission[] = [];
  let total = 0;

  if (resource === "contact") {
    const result = await getContactSubmissionPage(listQuery);
    contactItems = result.items;
    total = result.total;
  } else if (resource === "newsletter") {
    const result = await getNewsletterSubscriptionPage(listQuery);
    newsletterItems = result.items;
    total = result.total;
  } else {
    const result = await getCampaignSubmissionPage(listQuery);
    campaignItems = result.items;
    total = result.total;
  }

  return (
    <AdminSubmissionsManager
      resource={resource}
      query={query}
      status={status}
      campaignId={campaignId}
      page={page}
      pageSize={pageSize}
      total={total}
      contactItems={contactItems}
      newsletterItems={newsletterItems}
      campaignItems={campaignItems}
      campaignOptions={campaignOptions}
      canManage={hasPermission(currentUser.role, "submissions:manage")}
    />
  );
}
