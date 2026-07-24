"use client";

import { Card, Col, Progress, Row, Statistic, Table } from "antd";
import {
  ChartNoAxesCombined,
  Eye,
  Link2,
  MailCheck,
  Megaphone,
  UsersRound,
} from "lucide-react";

import { AdminAnalyticsChart } from "@/components/admin/AdminAnalyticsChart";
import { AdminAnalyticsDateFilter } from "@/components/admin/AdminAnalyticsDateFilter";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import type {
  AnalyticsDashboardData,
  AnalyticsRankedItem,
} from "@/types";

function RankedList({
  items,
  emptyText,
}: {
  items: readonly AnalyticsRankedItem[];
  emptyText: string;
}) {
  const maximum = Math.max(...items.map((item) => item.value), 1);
  if (items.length === 0) {
    return <p className="admin-analytics-empty">{emptyText}</p>;
  }

  return (
    <div className="admin-ranked-list">
      {items.map((item) => (
        <div key={item.id}>
          <div>
            <strong title={item.label}>{item.label}</strong>
            <span>{item.value.toLocaleString("vi-VN")}</span>
          </div>
          <Progress
            percent={Math.round((item.value / maximum) * 100)}
            showInfo={false}
            strokeColor="#7c3aed"
          />
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
  const stats = [
    {
      key: "views",
      label: "Tổng lượt xem trang",
      value: data.totals.pageViews,
      icon: Eye,
    },
    {
      key: "sessions",
      label: "Ước tính phiên duy nhất",
      value: data.totals.estimatedUniqueSessions,
      icon: UsersRound,
    },
    {
      key: "content",
      label: "Lượt xem nội dung",
      value: data.totals.contentViews,
      icon: ChartNoAxesCombined,
    },
    {
      key: "social",
      label: "Social clicks",
      value: data.totals.socialClicks,
      icon: Link2,
    },
    {
      key: "campaign",
      label: "Đăng ký chiến dịch",
      value: data.totals.campaignSubmissions,
      icon: Megaphone,
    },
    {
      key: "leads",
      label: "Contact / Newsletter",
      value:
        data.totals.contactSubmissions
        + data.totals.newsletterSubmissions,
      icon: MailCheck,
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Analytics tổng quan"
        description="Dữ liệu nội bộ đã tổng hợp phía server. Phiên duy nhất là ước tính từ mã phiên ẩn danh, không phải số người dùng tuyệt đối."
      />

      <AdminAnalyticsDateFilter
        range={data.range}
        targetPath="/admin"
        today={today}
      />

      <Row gutter={[16, 16]}>
        {stats.map(({ icon: Icon, ...stat }) => (
          <Col xs={24} sm={12} xl={8} key={stat.key}>
            <Card className="admin-stat-card">
              <div className="admin-stat-icon">
                <Icon aria-hidden="true" size={21} />
              </div>
              <Statistic
                title={stat.label}
                value={stat.value}
                groupSeparator="."
              />
              <span className="admin-stat-note">
                {stat.key === "sessions"
                  ? "Ước tính theo anonymous session"
                  : `${data.range.from} → ${data.range.to}`}
              </span>
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
        <Col xs={24} lg={12}>
          <Card title="Top bài viết" className="admin-dashboard-card">
            <RankedList
              items={data.topPosts}
              emptyText="Chưa có lượt xem bài viết trong khoảng ngày này."
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top video" className="admin-dashboard-card">
            <RankedList
              items={data.topVideos}
              emptyText="Chưa có lượt xem video trong khoảng ngày này."
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Nguồn truy cập" className="admin-dashboard-card">
            <RankedList
              items={data.trafficSources}
              emptyText="Chưa có dữ liệu nguồn truy cập."
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="UTM campaign" className="admin-dashboard-card">
            <RankedList
              items={data.utmCampaigns}
              emptyText="Chưa có UTM campaign."
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Thiết bị" className="admin-dashboard-card">
            <RankedList
              items={data.devices}
              emptyText="Chưa có dữ liệu thiết bị."
            />
          </Card>
        </Col>
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
            {
              title: "Conversion",
              dataIndex: "conversionRate",
              width: 130,
              render: (value: number) =>
                `${value.toLocaleString("vi-VN")} %`,
            },
          ]}
        />
      </Card>
    </>
  );
}
