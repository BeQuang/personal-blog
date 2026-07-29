"use client";

import { App, Button, Flex, Input, Select, Space, Switch, Table, Tooltip } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createSocialLinkAction,
  deleteSocialLinkAction,
  setSocialLinkEnabledAction,
  updateSocialLinkAction,
} from "@/actions/social-links.actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSocialLinkEditorModal } from "@/components/admin/AdminSocialLinkEditorModal";
import { useAdminListPage } from "@/components/admin/useAdminListPage";
import { useAdminViewportTable } from "@/components/admin/useAdminViewportTable";
import { adminTablePaginationDefaults } from "@/components/admin/admin-table.config";
import type {
  ActionFieldErrors,
  AdminListPage,
  AdminSocialLinkListQuery,
  SocialLink,
  SocialLinkMutationInput,
  SocialPlatform,
} from "@/types";
import { formatViewCount } from "@/utils/format";
import { getSocialAudienceConfig } from "@/utils/social-audience";

const platformOptions: { value: SocialPlatform | "all"; label: string }[] = [
  { value: "all", label: "Tất cả platform" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X" },
  { value: "threads", label: "Threads" },
  { value: "zalo", label: "Zalo" },
  { value: "telegram", label: "Telegram" },
  { value: "discord", label: "Discord" },
  { value: "website", label: "Website" },
  { value: "email", label: "Email" },
];

export function AdminSocialLinksManager({
  initialPage,
}: {
  initialPage: AdminListPage<SocialLink, AdminSocialLinkListQuery["sortBy"]>;
}) {
  const { message, modal } = App.useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<SocialPlatform | "all">("all");
  const [currentPage, setCurrentPage] = useState(initialPage.page);
  const [pageSize, setPageSize] = useState(initialPage.pageSize);
  const [sortBy, setSortBy] = useState(initialPage.sortBy);
  const [sortOrder, setSortOrder] = useState(initialPage.sortOrder);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [pending, startTransition] = useTransition();
  const initialSearchRender = useRef(true);
  const oauthStatusHandled = useRef(false);
  const reportListError = useCallback((error: string) => { void message.error(error); }, [message]);
  const { data, load, loading, reload } = useAdminListPage(
    "/api/admin/social-links",
    initialPage,
    reportListError,
  );
  const { tableBodyHeight, tablePanelRef } = useAdminViewportTable(data.items.length);
  const requestPage = useCallback((
    page: number,
    nextPageSize = pageSize,
    nextSortBy = sortBy,
    nextSortOrder = sortOrder,
  ) => load({
    page,
    pageSize: nextPageSize,
    query,
    platform,
    sortBy: nextSortBy,
    sortOrder: nextSortOrder,
  }), [load, pageSize, platform, query, sortBy, sortOrder]);
  const requestPageRef = useRef(requestPage);

  useEffect(() => {
    requestPageRef.current = requestPage;
  }, [requestPage]);

  useEffect(() => {
    if (oauthStatusHandled.current) return;
    oauthStatusHandled.current = true;
    const status = new URLSearchParams(window.location.search).get("tiktok");
    if (!status) return;
    const notifications: Record<string, { type: "success" | "warning" | "error"; text: string }> = {
      disabled: {
        type: "warning",
        text: "Đồng bộ tự động TikTok đang tạm tắt.",
      },
      cancelled: {
        type: "warning",
        text: "Bạn đã hủy cấp quyền TikTok.",
      },
      configuration_error: {
        type: "error",
        text: "Chưa thể bắt đầu kết nối TikTok. Hãy kiểm tra cấu hình ứng dụng TikTok.",
      },
      error: {
        type: "error",
        text: "Không thể hoàn tất kết nối TikTok. Hãy kiểm tra quyền user.info.stats rồi thử lại.",
      },
      invalid_state: {
        type: "error",
        text: "Phiên kết nối TikTok không hợp lệ hoặc đã hết hạn.",
      },
    };
    const notification = notifications[status];
    if (notification) void message[notification.type](notification.text);
    window.history.replaceState(null, "", window.location.pathname);
  }, [message]);

  useEffect(() => {
    if (initialSearchRender.current) {
      initialSearchRender.current = false;
      return;
    }
    const timeout = window.setTimeout(() => {
      setCurrentPage(1);
      void requestPageRef.current(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [platform, query]);

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
        await reload();
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
        await reload();
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
      title: "Chỉ số cộng đồng",
      dataIndex: "followerCount",
      key: "followerCount",
      sorter: true,
      sortDirections: ["ascend", "descend", "ascend"],
      sortOrder: sortBy === "followerCount"
        ? (sortOrder === "asc" ? "ascend" : "descend")
        : null,
      width: 120,
      render: (value: number | undefined, link) => {
        const config = getSocialAudienceConfig(link.platform);
        if (!config.label) return "—";
        const count = value === undefined ? "Chưa có dữ liệu" : formatViewCount(value);
        const detail = link.platform === "youtube"
          ? link.audienceSyncError
            ?? (link.audienceLastSyncedAt
              ? `Đồng bộ lúc ${new Date(link.audienceLastSyncedAt).toLocaleString("vi-VN")}`
              : "Đang chờ đồng bộ YouTube")
          : config.help;
        if (link.platform === "tiktok" && link.likesCount !== undefined) {
          return (
            <Tooltip title={detail}>
              <div className="admin-social-metric-cell">
                <span>{count} <small>người theo dõi</small></span>
                <span>{formatViewCount(link.likesCount)} <small>lượt thích</small></span>
              </div>
            </Tooltip>
          );
        }
        return (
          <Tooltip title={detail}>
            <span>{count} <small>{config.label.toLowerCase()}</small></span>
          </Tooltip>
        );
      },
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
                await reload();
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
    <div className="admin-viewport-list-page">
      <AdminPageHeader
        title="Mạng xã hội"
        description="Quản lý các kênh kết nối và thứ tự hiển thị trên website."
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
      <section
        className="admin-viewport-filter-panel admin-social-links-filter-panel"
        aria-label="Bộ lọc mạng xã hội"
      >
        <Flex className="admin-table-toolbar" gap={12} wrap>
          <Input
            size="large"
            allowClear
            prefix={<Search size={17} aria-hidden="true" />}
            placeholder="Tìm theo tên, platform, username hoặc URL..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
            aria-label="Tìm kiếm social links"
          />
          <Select
            size="large"
            value={platform}
            options={platformOptions}
            onChange={(nextPlatform) => {
              setPlatform(nextPlatform);
              setCurrentPage(1);
            }}
            aria-label="Lọc social links theo platform"
          />
        </Flex>
      </section>
      <section
        ref={tablePanelRef}
        className="admin-panel admin-table-panel admin-viewport-table-panel"
        aria-label="Danh sách social links"
      >
        <Table<SocialLink>
          rowKey="id"
          columns={columns}
          dataSource={[...data.items]}
          loading={pending || loading}
          scroll={{ x: 850, y: tableBodyHeight }}
          pagination={{
            ...adminTablePaginationDefaults,
            current: currentPage,
            pageSize,
            total: data.total,
          }}
          onChange={(
            pagination,
            _filters,
            sorter: Parameters<NonNullable<TableProps<SocialLink>["onChange"]>>[2],
          ) => {
            const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
            const nextSortBy = activeSorter?.columnKey === "followerCount"
              ? "followerCount"
              : sortBy;
            const nextSortOrder = activeSorter?.order
              ? (activeSorter.order === "ascend" ? "asc" : "desc")
              : sortOrder;
            const nextPageSize = pagination.pageSize ?? pageSize;
            const nextPage = nextPageSize !== pageSize ? 1 : (pagination.current ?? 1);
            setCurrentPage(nextPage);
            setPageSize(nextPageSize);
            setSortBy(nextSortBy);
            setSortOrder(nextSortOrder);
            void requestPage(nextPage, nextPageSize, nextSortBy, nextSortOrder);
          }}
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
    </div>
  );
}
