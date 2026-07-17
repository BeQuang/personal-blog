import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { adminMockMetrics } from "@/config/admin.config";
import { campaigns } from "@/data/campaigns";
import { events } from "@/data/events";
import { posts } from "@/data/posts";
import { videos } from "@/data/videos";

type AdminDashboardSearchParams = Promise<{
  error?: string | string[];
}>;

export const metadata: Metadata = { title: "Tổng quan" };

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: AdminDashboardSearchParams;
}) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const stats = [
    { key: "visits", label: "Tổng lượt truy cập", value: adminMockMetrics.totalVisits },
    { key: "posts", label: "Tổng bài viết", value: posts.length },
    { key: "videos", label: "Tổng video", value: videos.length },
    { key: "social", label: "Tổng lượt bấm social", value: adminMockMetrics.socialClicks },
    { key: "campaigns", label: "Chiến dịch đang chạy", value: campaigns.filter((item) => item.status === "active").length },
    { key: "events", label: "Sự kiện sắp tới", value: events.filter((item) => item.status === "upcoming").length },
  ];
  const latestItems = [...posts]
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
    .slice(0, 4)
    .map(({ id, title, status }) => ({ id, title, status }));

  return (
    <>
      {error === "forbidden" ? (
        <p className="admin-access-denied" role="alert">
          Tài khoản của bạn không có quyền truy cập khu vực vừa yêu cầu.
        </p>
      ) : null}
      <AdminDashboard stats={stats} latestItems={latestItems} />
    </>
  );
}
