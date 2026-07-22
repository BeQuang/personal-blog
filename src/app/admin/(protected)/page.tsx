import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { hasPermission, requireAdminPagePermission } from "@/server/auth";
import { getAnalyticsDashboard } from "@/server/services/analytics.service";

type AdminDashboardSearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = { title: "Analytics tổng quan" };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function dateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function resolveRange(params: Record<string, string | string[] | undefined>) {
  const today = new Date();
  const defaultFrom = new Date();
  defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 29);
  const from = first(params.from);
  const to = first(params.to);
  if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return { from: dateInput(defaultFrom), to: dateInput(today) };
  }
  const fromDate = new Date(`${from}T00:00:00.000Z`);
  const toDate = new Date(`${to}T00:00:00.000Z`);
  const days = Math.floor((toDate.getTime() - fromDate.getTime()) / 86_400_000) + 1;
  if (!Number.isFinite(days) || days < 1 || days > 366) {
    return { from: dateInput(defaultFrom), to: dateInput(today) };
  }
  return { from, to };
}

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
  const range = resolveRange(params);
  const pageValue = Number(first(params.page));
  const page = Number.isSafeInteger(pageValue) && pageValue >= 1
    ? Math.min(pageValue, 100_000)
    : 1;
  const data = await getAnalyticsDashboard({ ...range, page, pageSize: 20 });

  return <AdminDashboard data={data} today={dateInput(new Date())} />;
}
