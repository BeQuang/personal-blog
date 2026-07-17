"use client";

import { App, Button, Flex, Input, Space, Switch, Table, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createSocialLinkAction,
  deleteSocialLinkAction,
  setSocialLinkEnabledAction,
  updateSocialLinkAction,
} from "@/actions/social-links.actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSocialLinkEditorModal } from "@/components/admin/AdminSocialLinkEditorModal";
import type { ActionFieldErrors, SocialLink, SocialLinkMutationInput } from "@/types";
import { formatViewCount } from "@/utils/format";

export function AdminSocialLinksManager({ links }: { links: readonly SocialLink[] }) {
  const { message, modal } = App.useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [pending, startTransition] = useTransition();

  const filteredLinks = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi-VN");
    return links.filter((link) =>
      !normalized || [link.label, link.platform, link.username, link.url]
        .some((value) => value?.toLocaleLowerCase("vi-VN").includes(normalized)),
    );
  }, [links, query]);

  const submit = (input: SocialLinkMutationInput): Promise<ActionFieldErrors | undefined> =>
    new Promise((resolve) => {
      startTransition(async () => {
        const result = editing
          ? await updateSocialLinkAction(editing.id, input)
          : await createSocialLinkAction(input);
        if (!result.success) {
          void message.error(result.message);
          resolve(result.fieldErrors);
          return;
        }
        void message.success(result.message);
        setOpen(false);
        setEditing(null);
        router.refresh();
        resolve(undefined);
      });
    });

  const remove = (link: SocialLink) => {
    modal.confirm({
      title: `Xóa “${link.label}”?`,
      content: "Social link sẽ bị xóa khỏi database và public website.",
      okText: "Xóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: async () => {
        const result = await deleteSocialLinkAction(link.id);
        if (!result.success) {
          void message.error(result.message);
          throw new Error(result.message);
        }
        void message.success(result.message);
        router.refresh();
      },
    });
  };

  const columns: TableColumnsType<SocialLink> = [
    {
      title: "Kênh",
      key: "channel",
      width: 260,
      render: (_, link) => (
        <div className="admin-table-title">
          <strong>{link.label}</strong>
          <span>{link.username ?? link.url}</span>
        </div>
      ),
    },
    { title: "Platform", dataIndex: "platform", key: "platform", width: 130 },
    {
      title: "Followers",
      dataIndex: "followerCount",
      key: "followerCount",
      width: 120,
      render: (value?: number) => value === undefined ? "—" : formatViewCount(value),
    },
    { title: "Thứ tự", dataIndex: "order", key: "order", width: 90, align: "center" },
    {
      title: "Hiển thị",
      dataIndex: "enabled",
      key: "enabled",
      width: 100,
      align: "center",
      render: (enabled: boolean, link) => (
        <Switch
          size="small"
          checked={enabled}
          disabled={pending}
          aria-label={`${enabled ? "Tắt" : "Bật"} ${link.label}`}
          onChange={(checked) => {
            startTransition(async () => {
              const result = await setSocialLinkEnabledAction(link.id, checked);
              if (result.success) {
                void message.success(result.message);
                router.refresh();
              } else {
                void message.error(result.message);
              }
            });
          }}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 112,
      render: (_, link) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              aria-label={`Chỉnh sửa ${link.label}`}
              icon={<Pencil size={16} aria-hidden="true" />}
              onClick={() => {
                setEditing(link);
                setOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              aria-label={`Xóa ${link.label}`}
              icon={<Trash2 size={16} aria-hidden="true" />}
              onClick={() => remove(link)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Mạng xã hội"
        description="Quản lý social links thật trong PostgreSQL; public chỉ nhận các kênh đang bật theo đúng thứ tự."
        action={
          <Button
            type="primary"
            icon={<Plus size={17} aria-hidden="true" />}
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            Thêm social link
          </Button>
        }
      />
      <section className="admin-panel admin-table-panel" aria-label="Danh sách social links">
        <Flex className="admin-table-toolbar" gap={12} wrap>
          <Input
            allowClear
            prefix={<Search size={17} aria-hidden="true" />}
            placeholder="Tìm theo tên, platform, username hoặc URL..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Tìm kiếm social links"
          />
        </Flex>
        <Table<SocialLink>
          rowKey="id"
          columns={columns}
          dataSource={[...filteredLinks]}
          loading={pending}
          scroll={{ x: 850 }}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          locale={{ emptyText: "Không có social link phù hợp." }}
        />
      </section>
      <AdminSocialLinkEditorModal
        open={open}
        link={editing}
        pending={pending}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
        }}
        onSubmit={submit}
      />
    </>
  );
}
