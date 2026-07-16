import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { adminMockMetrics } from "@/config/admin.config";
import { campaigns } from "@/data/campaigns";
import { events } from "@/data/events";
import { posts } from "@/data/posts";
import { videos } from "@/data/videos";

export const metadata: Metadata = { title: "Tổng quan" };

export default function AdminDashboardPage() {
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

  return <AdminDashboard stats={stats} latestItems={latestItems} />;
}
