"use client";

import { Button, Card, Col, Progress, Row, Statistic, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import {
  ChartNoAxesCombined,
  Eye,
  Link2,
  MailCheck,
  Megaphone,
  MousePointerClick,
  UsersRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminAnalyticsChart } from "@/components/admin/AdminAnalyticsChart";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import type {
  AnalyticsDashboardData,
  AnalyticsRankedItem,
  AnalyticsRecentEvent,
} from "@/types";

const eventLabels: Record<string, string> = {
  page_view: "Xem trang",
  post_view: "Xem bài viết",
  video_view: "Xem video",
  social_click: "Bấm social",
  campaign_view: "Xem chiến dịch",
  campaign_click: "Bấm chiến dịch",
  campaign_submit: "Đăng ký chiến dịch",
  contact_submit: "Gửi liên hệ",
  newsletter_submit: "Đăng ký newsletter",
};

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function createPresetRange(days: number, today: string) {
  const to = new Date(`${today}T00:00:00.000Z`);
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - days + 1);
  return { from: toDateInput(from), to: toDateInput(to) };
}

function RankedList({ items, emptyText }: { items: readonly AnalyticsRankedItem[]; emptyText: string }) {
  const maximum = Math.max(...items.map((item) => item.value), 1);
  if (items.length === 0) return <p className="admin-analytics-empty">{emptyText}</p>;
  return (
    <div className="admin-ranked-list">
      {items.map((item) => (
        <div key={item.id}>
          <div><strong title={item.label}>{item.label}</strong><span>{item.value.toLocaleString("vi-VN")}</span></div>
          <Progress percent={Math.round((item.value / maximum) * 100)} showInfo={false} strokeColor="#7c3aed" />
        </div>
      ))}
    </div>
  );
}
export function AdminDashboard({
  data,
  today,
}: {
  data: AnalyticsDashboardData;
  today: string;
}) {
  const router = useRouter();
  const [customFrom, setCustomFrom] = useState(data.range.from);
  const [customTo, setCustomTo] = useState(data.range.to);
  const stats = [
    { key: "views", label: "Tổng lượt xem trang", value: data.totals.pageViews, icon: Eye },
    { key: "sessions", label: "Ước tính phiên duy nhất", value: data.totals.estimatedUniqueSessions, icon: UsersRound },
    { key: "content", label: "Lượt xem nội dung", value: data.totals.contentViews, icon: ChartNoAxesCombined },
    { key: "social", label: "Social clicks", value: data.totals.socialClicks, icon: Link2 },
    { key: "campaign", label: "Đăng ký chiến dịch", value: data.totals.campaignSubmissions, icon: Megaphone },
    { key: "leads", label: "Contact / Newsletter", value: data.totals.contactSubmissions + data.totals.newsletterSubmissions, icon: MailCheck },
  ];

  function navigate(from: string, to: string, page = 1) {
    const params = new URLSearchParams({ from, to, page: String(page) });
    router.push(`/admin?${params.toString()}`);
  }

  const recentColumns: TableColumnsType<AnalyticsRecentEvent> = [
    { title: "Sự kiện", dataIndex: "eventType", width: 175, render: (value: string) => <Tag color="purple">{eventLabels[value] ?? value}</Tag> },
    { title: "Đường dẫn", dataIndex: "path", ellipsis: true },
    { title: "Thiết bị", dataIndex: "deviceCategory", width: 120, render: (value?: string) => value ?? "—" },
    { title: "Nguồn", dataIndex: "referrerDomain", width: 180, ellipsis: true, render: (value?: string) => value ?? "Trực tiếp" },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      width: 175,
      render: (value: string) => (
        <time dateTime={value}>
          {new Intl.DateTimeFormat("vi-VN", {
            dateStyle: "short",
            timeStyle: "short",
            timeZone: "Asia/Ho_Chi_Minh",
          }).format(new Date(value))}
        </time>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Analytics tổng quan"
        description="Dữ liệu nội bộ đã tổng hợp phía server. Phiên duy nhất là ước tính từ mã phiên ẩn danh, không phải số người dùng tuyệt đối."
      />

      <section className="admin-analytics-filters" aria-label="Lọc thời gian analytics">
        <div className="admin-analytics-presets">
          {[7, 30, 90].map((days) => {
            const preset = createPresetRange(days, today);
            const active = data.range.from === preset.from && data.range.to === preset.to;
            return <Button key={days} type={active ? "primary" : "default"} onClick={() => navigate(preset.from, preset.to)}>{days} ngày</Button>;
          })}
        </div>
        <div className="admin-analytics-custom-range">
          <label>Từ ngày<input type="date" value={customFrom} max={customTo} onChange={(event) => setCustomFrom(event.target.value)} /></label>
          <label>Đến ngày<input type="date" value={customTo} min={customFrom} onChange={(event) => setCustomTo(event.target.value)} /></label>
          <Button icon={<MousePointerClick size={16} aria-hidden="true" />} onClick={() => navigate(customFrom, customTo)} disabled={!customFrom || !customTo || customFrom > customTo}>Áp dụng</Button>
        </div>
      </section>

      <Row gutter={[16, 16]}>
        {stats.map(({ icon: Icon, ...stat }) => (
          <Col xs={24} sm={12} xl={8} key={stat.key}>
            <Card className="admin-stat-card">
              <div className="admin-stat-icon"><Icon aria-hidden="true" size={21} /></div>
              <Statistic title={stat.label} value={stat.value} groupSeparator="." />
              <span className="admin-stat-note">{stat.key === "sessions" ? "Ước tính theo anonymous session" : `${data.range.from} → ${data.range.to}`}</span>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="admin-dashboard-row">
        <Col xs={24}>
          <Card title="Dữ liệu theo ngày" className="admin-dashboard-card">
            <AdminAnalyticsChart data={data.daily} />
          </Card>
        </Col>
        <Col xs={24} lg={12}><Card title="Top bài viết" className="admin-dashboard-card"><RankedList items={data.topPosts} emptyText="Chưa có lượt xem bài viết trong khoảng ngày này." /></Card></Col>
        <Col xs={24} lg={12}><Card title="Top video" className="admin-dashboard-card"><RankedList items={data.topVideos} emptyText="Chưa có lượt xem video trong khoảng ngày này." /></Card></Col>
        <Col xs={24} lg={8}><Card title="Nguồn truy cập" className="admin-dashboard-card"><RankedList items={data.trafficSources} emptyText="Chưa có dữ liệu nguồn truy cập." /></Card></Col>
        <Col xs={24} lg={8}><Card title="UTM campaign" className="admin-dashboard-card"><RankedList items={data.utmCampaigns} emptyText="Chưa có UTM campaign." /></Card></Col>
        <Col xs={24} lg={8}><Card title="Thiết bị" className="admin-dashboard-card"><RankedList items={data.devices} emptyText="Chưa có dữ liệu thiết bị." /></Card></Col>
      </Row>

      <Card title="Hiệu quả chiến dịch" className="admin-dashboard-card">
        <Table
          rowKey="id"
          dataSource={[...data.campaigns]}
          pagination={false}
          scroll={{ x: 760 }}
          locale={{ emptyText: "Chưa có dữ liệu chiến dịch." }}
          columns={[
            { title: "Chiến dịch", dataIndex: "label" },
            { title: "Views", dataIndex: "views", width: 110 },
            { title: "Clicks", dataIndex: "clicks", width: 110 },
            { title: "Submits", dataIndex: "submissions", width: 110 },
            { title: "Conversion", dataIndex: "conversionRate", width: 130, render: (value: number) => `${value.toLocaleString("vi-VN")} %` },
          ]}
        />
      </Card>

      <Card title="Sự kiện gần đây" className="admin-dashboard-card">
        <Table
          rowKey="id"
          columns={recentColumns}
          dataSource={[...data.recentEvents.items]}
          scroll={{ x: 920 }}
          locale={{ emptyText: "Chưa có event trong khoảng ngày này." }}
          pagination={{
            current: data.recentEvents.page,
            pageSize: data.recentEvents.pageSize,
            total: data.recentEvents.total,
            showSizeChanger: false,
            onChange: (page) => navigate(data.range.from, data.range.to, page),
          }}
        />
      </Card>
    </>
  );
}
