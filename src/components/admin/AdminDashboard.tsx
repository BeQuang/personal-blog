"use client";

import { Card, Col, Progress, Row, Statistic, Tag, Timeline } from "antd";
import {
  CalendarClock,
  Eye,
  FileText,
  Link2,
  Megaphone,
  Video,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

interface DashboardStat {
  key: string;
  label: string;
  value: number;
  suffix?: string;
}

interface LatestItem {
  id: string;
  title: string;
  status: string;
}

const statIcons = {
  visits: Eye,
  posts: FileText,
  videos: Video,
  social: Link2,
  campaigns: Megaphone,
  events: CalendarClock,
} as const;

const chartValues = [42, 58, 51, 72, 66, 84, 78, 91, 76, 88, 93, 86];

export function AdminDashboard({
  stats,
  latestItems,
}: {
  stats: DashboardStat[];
  latestItems: LatestItem[];
}) {
  return (
    <>
      <AdminPageHeader
        title="Tổng quan"
        description="Ảnh chụp nhanh dữ liệu nội dung và hiệu suất. Tất cả chỉ là số liệu minh họa cho dashboard demo."
      />

      <Row gutter={[16, 16]}>
        {stats.map((stat) => {
          const Icon = statIcons[stat.key as keyof typeof statIcons];
          return (
            <Col xs={24} sm={12} xl={8} key={stat.key}>
              <Card className="admin-stat-card">
                <div className="admin-stat-icon">
                  {Icon ? <Icon aria-hidden="true" size={21} /> : null}
                </div>
                <Statistic title={stat.label} value={stat.value} suffix={stat.suffix} groupSeparator="." />
                <span className="admin-stat-note">Dữ liệu mock</span>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row gutter={[16, 16]} className="admin-dashboard-row">
        <Col xs={24} xl={15}>
          <Card title="Lượt truy cập 12 tháng" extra={<Tag color="purple">Placeholder</Tag>} className="admin-dashboard-card">
            <div className="admin-chart" role="img" aria-label="Biểu đồ cột minh họa lượt truy cập tăng dần trong 12 tháng">
              {chartValues.map((value, index) => (
                <span key={index} style={{ height: `${value}%` }} title={`Tháng ${index + 1}: ${value}%`} />
              ))}
            </div>
            <div className="admin-chart-axis"><span>T1</span><span>T6</span><span>T12</span></div>
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card title="Nội dung mới nhất" className="admin-dashboard-card">
            <Timeline
              items={latestItems.map((item) => ({
                color: item.status === "published" ? "green" : "blue",
                content: (
                  <div className="admin-latest-item">
                    <strong>{item.title}</strong>
                    <Tag>{item.status}</Tag>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Mức độ hoàn thiện nội dung" className="admin-dashboard-card admin-progress-card">
        <div><span>Bài viết</span><Progress percent={82} strokeColor="#7c3aed" /></div>
        <div><span>Video</span><Progress percent={68} strokeColor="#ec4899" /></div>
        <div><span>Chiến dịch</span><Progress percent={54} strokeColor="#0891b2" /></div>
      </Card>
    </>
  );
}
