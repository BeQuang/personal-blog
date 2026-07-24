import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import {
  analyticsDateInput,
  type AdminAnalyticsSearchParams,
  resolveAdminAnalyticsRange,
} from "@/lib/admin-analytics-query";
import { hasPermission, requireAdminPagePermission } from "@/server/auth";
import { getAnalyticsDashboard } from "@/server/services/analytics.service";

type AdminDashboardSearchParams = Promise<AdminAnalyticsSearchParams>;

export const metadata: Metadata = { title: "Analytics tổng quan" };

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: AdminDashboardSearchParams;
}) {
  const currentUser = await requireAdminPagePermission("dashboard:view");
  if (!hasPermission(currentUser.role, "analytics:view")) {
    redirect("/admin/posts");
  }

  const params = await searchParams;
  const range = resolveAdminAnalyticsRange(params);
  const data = await getAnalyticsDashboard(range);

  return (
    <AdminDashboard
      data={data}
      today={analyticsDateInput(new Date())}
    />
  );
}
