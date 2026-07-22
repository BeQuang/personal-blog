"use client";

import {
  App,
  Button,
  Descriptions,
  Input,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
} from "antd";
import type { TableColumnsType } from "antd";
import { Download, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateSubmissionStatusAction } from "@/actions/submissions.actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import type {
  AdminCampaignSubmission,
  AdminContactSubmission,
  AdminNewsletterSubscription,
  SubmissionCampaignOption,
  SubmissionResource,
} from "@/types";

interface Props {
  resource: SubmissionResource;
  query: string;
  status: string;
  campaignId: string;
  page: number;
  pageSize: number;
  total: number;
  contactItems: readonly AdminContactSubmission[];
  newsletterItems: readonly AdminNewsletterSubscription[];
  campaignItems: readonly AdminCampaignSubmission[];
  campaignOptions: readonly SubmissionCampaignOption[];
  canManage: boolean;
}

const statusLabels: Record<string, string> = {
  new: "Mới",
  read: "Đã đọc",
  replied: "Đã phản hồi",
  reviewing: "Đang xem xét",
  accepted: "Đã chấp nhận",
  rejected: "Đã từ chối",
  spam: "Spam",
  archived: "Đã lưu trữ",
  subscribed: "Đang đăng ký",
  unsubscribed: "Đã hủy",
  suppressed: "Đã chặn",
};

const resourceStatuses = {
  contact: ["new", "read", "replied", "spam", "archived"],
  newsletter: ["subscribed", "unsubscribed", "suppressed"],
  campaign: ["new", "reviewing", "accepted", "rejected", "spam", "archived"],
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatusTag({ status }: { status: string }) {
  const color = status === "new" || status === "subscribed"
    ? "blue"
    : status === "accepted" || status === "replied"
      ? "green"
      : status === "spam" || status === "rejected" || status === "suppressed"
        ? "red"
        : "default";
  return <Tag color={color}>{statusLabels[status] ?? status}</Tag>;
}

export function AdminSubmissionsManager(props: Props) {
  const router = useRouter();
  const { message } = App.useApp();
  const [searchValue, setSearchValue] = useState(props.query);
  const [pending, startTransition] = useTransition();

  function navigate(updates: Record<string, string | number | undefined>) {
    const params = new URLSearchParams();
    params.set("resource", props.resource);
    if (props.query) params.set("query", props.query);
    if (props.status) params.set("status", props.status);
    if (props.campaignId) params.set("campaignId", props.campaignId);
    params.set("page", String(props.page));

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "") params.delete(key);
      else params.set(key, String(value));
    }
    router.push(`/admin/submissions?${params.toString()}`);
  }

  function changeStatus(resource: SubmissionResource, id: string, status: string) {
    startTransition(async () => {
      const result = await updateSubmissionStatusAction(resource, id, status);
      if (!result.success) {
        void message.error(result.message);
        return;
      }
      void message.success(result.message);
      router.refresh();
    });
  }

  function statusControl(resource: SubmissionResource, id: string, status: string) {
    if (!props.canManage) return <StatusTag status={status} />;
    return (
      <Select
        value={status}
        disabled={pending}
        aria-label="Cập nhật trạng thái"
        style={{ minWidth: 145 }}
        options={resourceStatuses[resource].map((value) => ({
          value,
          label: statusLabels[value],
        }))}
        onChange={(value) => changeStatus(resource, id, value)}
      />
    );
  }

  const contactColumns: TableColumnsType<AdminContactSubmission> = [
    {
      title: "Người gửi",
      render: (_, item) => <div className="admin-table-title"><strong>{item.fullName}</strong><span>{item.email}</span></div>,
    },
    {
      title: "Nhu cầu",
      render: (_, item) => <div className="admin-table-title"><strong>{item.collaborationType}</strong><span>{item.company || "Cá nhân"}</span></div>,
    },
    { title: "Ngày gửi", width: 165, render: (_, item) => formatDate(item.createdAt) },
    { title: "Trạng thái", width: 180, render: (_, item) => statusControl("contact", item.id, item.status) },
  ];
  const newsletterColumns: TableColumnsType<AdminNewsletterSubscription> = [
    { title: "Email", dataIndex: "email" },
    { title: "Ngày đăng ký", width: 180, render: (_, item) => formatDate(item.subscribedAt) },
    { title: "Trạng thái", width: 190, render: (_, item) => statusControl("newsletter", item.id, item.status) },
  ];
  const campaignColumns: TableColumnsType<AdminCampaignSubmission> = [
    {
      title: "Người tham gia",
      render: (_, item) => <div className="admin-table-title"><strong>{item.fullName}</strong><span>{item.email}</span></div>,
    },
    { title: "Chiến dịch", dataIndex: "campaignTitle" },
    { title: "Ngày gửi", width: 165, render: (_, item) => formatDate(item.createdAt) },
    { title: "Trạng thái", width: 180, render: (_, item) => statusControl("campaign", item.id, item.status) },
  ];

  const exportParams = new URLSearchParams({ resource: props.resource });
  if (props.query) exportParams.set("query", props.query);
  if (props.status) exportParams.set("status", props.status);
  if (props.campaignId) exportParams.set("campaignId", props.campaignId);

  const pagination = {
    current: props.page,
    pageSize: props.pageSize,
    total: props.total,
    showSizeChanger: false,
    onChange: (page: number) => navigate({ page }),
  };

  return (
    <>
      <AdminPageHeader
        title="Hộp thư và đăng ký"
        description="Quản lý contact, newsletter và người tham gia chiến dịch. Dữ liệu chống spam không được hiển thị tại đây."
        action={(
          <Button
            href={`/api/admin/submissions/export?${exportParams.toString()}`}
            icon={<Download size={17} aria-hidden="true" />}
          >
            Export CSV
          </Button>
        )}
      />

      <section className="admin-panel admin-table-panel" aria-label="Danh sách submissions">
        <Tabs
          activeKey={props.resource}
          items={[
            { key: "contact", label: "Contact inbox" },
            { key: "newsletter", label: "Newsletter" },
            { key: "campaign", label: "Người tham gia chiến dịch" },
          ]}
          onChange={(resource) => router.push(`/admin/submissions?resource=${resource}`)}
        />

        <Space wrap className="admin-submission-toolbar">
          <Input
            allowClear
            value={searchValue}
            prefix={<Search size={16} aria-hidden="true" />}
            placeholder="Tìm tên, email hoặc chiến dịch"
            onChange={(event) => setSearchValue(event.target.value)}
            onPressEnter={() => navigate({ query: searchValue.trim(), page: 1 })}
          />
          <Button onClick={() => navigate({ query: searchValue.trim(), page: 1 })}>
            Tìm kiếm
          </Button>
          <Select
            allowClear
            value={props.status || undefined}
            placeholder="Tất cả trạng thái"
            style={{ minWidth: 180 }}
            options={resourceStatuses[props.resource].map((value) => ({
              value,
              label: statusLabels[value],
            }))}
            onChange={(status) => navigate({ status, page: 1 })}
          />
          {props.resource === "campaign" ? (
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              value={props.campaignId || undefined}
              placeholder="Tất cả chiến dịch"
              style={{ minWidth: 240 }}
              options={props.campaignOptions.map((campaign) => ({
                value: campaign.id,
                label: campaign.title,
              }))}
              onChange={(campaignId) => navigate({ campaignId, page: 1 })}
            />
          ) : null}
        </Space>

        {props.resource === "contact" ? (
          <Table
            rowKey="id"
            loading={pending}
            columns={contactColumns}
            dataSource={[...props.contactItems]}
            scroll={{ x: 850 }}
            pagination={pagination}
            locale={{ emptyText: "Chưa có yêu cầu liên hệ phù hợp." }}
            expandable={{
              expandedRowRender: (item) => (
                <Descriptions size="small" column={1} bordered>
                  <Descriptions.Item label="Số điện thoại">{item.phone || "Không cung cấp"}</Descriptions.Item>
                  <Descriptions.Item label="Ngân sách">{item.budgetRange || "Không cung cấp"}</Descriptions.Item>
                  <Descriptions.Item label="Nội dung"><span className="whitespace-pre-wrap">{item.message}</span></Descriptions.Item>
                </Descriptions>
              ),
            }}
          />
        ) : props.resource === "newsletter" ? (
          <Table
            rowKey="id"
            loading={pending}
            columns={newsletterColumns}
            dataSource={[...props.newsletterItems]}
            scroll={{ x: 650 }}
            pagination={pagination}
            locale={{ emptyText: "Chưa có đăng ký newsletter phù hợp." }}
          />
        ) : (
          <Table
            rowKey="id"
            loading={pending}
            columns={campaignColumns}
            dataSource={[...props.campaignItems]}
            scroll={{ x: 900 }}
            pagination={pagination}
            locale={{ emptyText: "Chưa có người tham gia phù hợp." }}
            expandable={{
              expandedRowRender: (item) => (
                <Descriptions size="small" column={1} bordered>
                  <Descriptions.Item label="Số điện thoại">{item.phone || "Không cung cấp"}</Descriptions.Item>
                  <Descriptions.Item label="Nền tảng">{item.followedPlatform || "Không cung cấp"}</Descriptions.Item>
                  <Descriptions.Item label="Username">{item.socialUsername || "Không cung cấp"}</Descriptions.Item>
                  <Descriptions.Item label="Ghi chú"><span className="whitespace-pre-wrap">{item.notes || "Không có"}</span></Descriptions.Item>
                </Descriptions>
              ),
            }}
          />
        )}
      </section>
    </>
  );
}
