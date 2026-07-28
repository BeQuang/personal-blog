"use client";

import { App, Button, Flex, Input, Select, Space, Switch, Table, Tag, Tooltip } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import { Archive, EyeOff, Pencil, Plus, Search, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  archivePostAction,
  createPostAction,
  setPostFeaturedAction,
  setPostStatusAction,
  updatePostAction,
} from "@/actions/posts.actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPostEditorModal } from "@/components/admin/AdminPostEditorModal";
import { AdminTaxonomyManager } from "@/components/admin/AdminTaxonomyManager";
import { useAdminListPage } from "@/components/admin/useAdminListPage";
import {
  adminStatusColors,
  adminStatusLabels,
  adminTablePaginationDefaults,
  formatAdminDate,
} from "@/components/admin/admin-table.config";
import type {
  ActionFieldErrors,
  AdminListPage,
  AdminPost,
  AdminPostListQuery,
  MediaOption,
  PostMutationInput,
  TaxonomyItem,
} from "@/types";

interface AdminPostsManagerProps {
  initialPage: AdminListPage<AdminPost, AdminPostListQuery["sortBy"]>;
  categories: readonly TaxonomyItem[];
  tags: readonly TaxonomyItem[];
  mediaOptions: readonly MediaOption[];
  canWrite: boolean;
  canPublish: boolean;
}

export function AdminPostsManager({
  initialPage,
  categories,
  tags,
  mediaOptions,
  canWrite,
  canPublish,
}: AdminPostsManagerProps) {
  const { message, modal } = App.useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage.page);
  const [pageSize, setPageSize] = useState(initialPage.pageSize);
  const [sortBy, setSortBy] = useState(initialPage.sortBy);
  const [sortOrder, setSortOrder] = useState(initialPage.sortOrder);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);
  const [tableBodyHeight, setTableBodyHeight] = useState(240);
  const [pending, startTransition] = useTransition();
  const tablePanelRef = useRef<HTMLElement>(null);
  const initialFilterRender = useRef(true);
  const reportListError = useCallback((error: string) => {
    void message.error(error);
  }, [message]);
  const {
    data: postsPage,
    load: loadPosts,
    loading: postsLoading,
    reload: reloadPosts,
  } = useAdminListPage("/api/admin/posts", initialPage, reportListError);
  const requestPage = useCallback((
    page: number,
    nextPageSize = pageSize,
    nextSortBy = sortBy,
    nextSortOrder = sortOrder,
  ) => loadPosts({
    page,
    pageSize: nextPageSize,
    query,
    status,
    includeArchived: showArchived,
    sortBy: nextSortBy,
    sortOrder: nextSortOrder,
  }), [loadPosts, pageSize, query, showArchived, sortBy, sortOrder, status]);
  const requestPageRef = useRef(requestPage);
  useEffect(() => {
    requestPageRef.current = requestPage;
  }, [requestPage]);

  useEffect(() => {
    if (initialFilterRender.current) {
      initialFilterRender.current = false;
      return;
    }
    const timeout = window.setTimeout(() => {
      setCurrentPage(1);
      void requestPageRef.current(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [query, showArchived, status]);

  useEffect(() => {
    const panel = tablePanelRef.current;
    const page = panel?.parentElement;
    if (!panel || !page) return;

    const getOuterHeight = (element: HTMLElement | null) => {
      if (!element) return 0;
      const styles = window.getComputedStyle(element);
      return (
        element.getBoundingClientRect().height +
        Number.parseFloat(styles.marginTop || "0") +
        Number.parseFloat(styles.marginBottom || "0")
      );
    };

    const measureTableBody = () => {
      const tableHeader = panel.querySelector<HTMLElement>(".ant-table-header");
      const pagination = panel.querySelector<HTMLElement>(".ant-pagination");
      const pageBounds = page.getBoundingClientRect();
      const panelBounds = panel.getBoundingClientRect();
      const availablePanelHeight = Math.max(
        0,
        pageBounds.bottom - panelBounds.top,
      );
      const reservedHeight =
        getOuterHeight(tableHeader) +
        getOuterHeight(pagination);
      const nextHeight = Math.max(
        48,
        Math.floor(availablePanelHeight - reservedHeight - 2),
      );

      setTableBodyHeight((currentHeight) =>
        currentHeight === nextHeight ? currentHeight : nextHeight,
      );
    };

    const observer = new ResizeObserver(measureTableBody);
    const tableHeader = panel.querySelector<HTMLElement>(".ant-table-header");
    const pagination = panel.querySelector<HTMLElement>(".ant-pagination");

    observer.observe(page);
    if (tableHeader) observer.observe(tableHeader);
    if (pagination) observer.observe(pagination);
    const frame = window.requestAnimationFrame(measureTableBody);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [postsPage.items.length]);

  const runResult = async (operation: () => Promise<{ success: boolean; message: string }>) => {
    const result = await operation();
    if (result.success) {
      void message.success(result.message);
      await reloadPosts();
      router.refresh();
    } else {
      void message.error(result.message);
    }
    return result.success;
  };

  const changeStatus = (post: AdminPost, nextStatus: "draft" | "published") => {
    startTransition(async () => {
      await runResult(() => setPostStatusAction(post.id, nextStatus));
    });
  };

  const confirmArchive = (post: AdminPost) => {
    modal.confirm({
      title: `Lưu trữ “${post.title}”?`,
      content: "Bài viết sẽ biến mất khỏi public và được giữ lại trong Admin với trạng thái lưu trữ.",
      okText: "Lưu trữ",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: async () => {
        const result = await archivePostAction(post.id);
        if (!result.success) {
          void message.error(result.message);
          throw new Error(result.message);
        }
        void message.success(result.message);
        setCurrentPage(1);
        await requestPage(1);
        router.refresh();
      },
    });
  };

  const columns: TableColumnsType<AdminPost> = [
    {
      title: "STT",
      key: "index",
      width: 68,
      align: "center",
      render: (_, __, rowIndex) =>
        (currentPage - 1) * pageSize + rowIndex + 1,
    },
    {
      title: "Bài viết",
      key: "title",
      sorter: true,
      sortOrder: sortBy === "title"
        ? (sortOrder === "asc" ? "ascend" : "descend")
        : null,
      width: 330,
      render: (_, post) => (
        <div className="admin-table-title">
          <strong>{post.title}</strong>
          <span>{post.slug}</span>
        </div>
      ),
    },
    {
      title: "Phân loại",
      key: "taxonomy",
      width: 220,
      render: (_, post) => (
        <div className="admin-table-taxonomy">
          <strong>{post.categoryName}</strong>
          <span>{post.tagNames.length > 0 ? post.tagNames.join(", ") : "Chưa có thẻ"}</span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      sorter: true,
      sortOrder: sortBy === "status"
        ? (sortOrder === "asc" ? "ascend" : "descend")
        : null,
      width: 145,
      render: (value: AdminPost["status"]) => (
        <Tag color={adminStatusColors[value] ?? "default"}>
          {value === "archived" ? "Đã lưu trữ" : (adminStatusLabels[value] ?? value)}
        </Tag>
      ),
    },
    {
      title: "Ngày",
      key: "date",
      sorter: true,
      sortOrder: sortBy === "updatedAt"
        ? (sortOrder === "asc" ? "ascend" : "descend")
        : null,
      width: 120,
      render: (_, post) => formatAdminDate(post.publishedAt ?? post.scheduledAt ?? post.updatedAt),
    },
    {
      title: "Nổi bật",
      dataIndex: "featured",
      key: "featured",
      width: 90,
      align: "center",
      render: (featured: boolean, post) => (
        <Switch
          size="small"
          checked={featured}
          disabled={pending || !canWrite || (post.status !== "draft" && !canPublish)}
          aria-label={`Đặt ${post.title} là bài viết nổi bật`}
          onChange={(checked) => {
            startTransition(async () => {
              await runResult(() => setPostFeaturedAction(post.id, checked));
            });
          }}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 180,
      render: (_, post) => {
        const editable = canWrite && (post.status === "draft" || canPublish);
        return (
          <Space size="small">
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                disabled={!editable}
                aria-label={`Chỉnh sửa ${post.title}`}
                icon={<Pencil size={16} aria-hidden="true" />}
                onClick={() => {
                  setEditingPost(post);
                  setEditorOpen(true);
                }}
              />
            </Tooltip>
            {canPublish && post.status !== "archived" ? (
              post.status === "published" ? (
                <Tooltip title="Gỡ xuất bản">
                  <Button
                    type="text"
                    aria-label={`Gỡ xuất bản ${post.title}`}
                    disabled={pending}
                    icon={<EyeOff size={16} aria-hidden="true" />}
                    onClick={() => changeStatus(post, "draft")}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Xuất bản ngay">
                  <Button
                    type="text"
                    aria-label={`Xuất bản ${post.title}`}
                    disabled={pending}
                    icon={<Send size={16} aria-hidden="true" />}
                    onClick={() => changeStatus(post, "published")}
                  />
                </Tooltip>
              )
            ) : null}
            {canPublish && post.status !== "archived" ? (
              <Tooltip title="Lưu trữ">
                <Button
                  type="text"
                  danger
                  aria-label={`Lưu trữ ${post.title}`}
                  icon={<Archive size={16} aria-hidden="true" />}
                  onClick={() => confirmArchive(post)}
                />
              </Tooltip>
            ) : null}
          </Space>
        );
      },
    },
  ];

  const submitPost = (input: PostMutationInput): Promise<ActionFieldErrors | undefined> =>
    new Promise((resolve) => {
      startTransition(async () => {
        const result = editingPost
          ? await updatePostAction(editingPost.id, input)
          : await createPostAction(input);
        if (!result.success) {
          void message.error(result.message);
          resolve(result.fieldErrors);
          return;
        }
        void message.success(result.message);
        setEditorOpen(false);
        setEditingPost(null);
        setCurrentPage(1);
        await requestPage(1);
        router.refresh();
        resolve(undefined);
      });
    });

  return (
    <div className="admin-posts-page">
      <AdminPageHeader
        title="Bài viết"
        description="Quản lý nội dung, lịch xuất bản, phân loại và tối ưu SEO cho bài viết."
        action={
          <Flex gap={8} wrap>
            <AdminTaxonomyManager type="category" label="Danh mục" canWrite={canWrite} />
            <AdminTaxonomyManager type="tag" label="Thẻ" canWrite={canWrite} />
            <Button
              type="primary"
              disabled={!canWrite || categories.length === 0}
              icon={<Plus size={17} aria-hidden="true" />}
              onClick={() => {
                setEditingPost(null);
                setEditorOpen(true);
              }}
            >
              Tạo bài viết
            </Button>
          </Flex>
        }
      />

      {categories.length === 0 ? (
        <p className="admin-access-denied">Hãy tạo ít nhất một danh mục trước khi tạo bài viết.</p>
      ) : null}

      <section className="admin-posts-filter-panel" aria-label="Bộ lọc bài viết">
        <Flex className="admin-table-toolbar" gap={12} justify="space-between" wrap>
          <Flex className="admin-posts-filter-left" gap={12} wrap>
            <Input
              size="large"
              allowClear
              prefix={<Search size={17} aria-hidden="true" />}
              placeholder="Tìm theo tiêu đề, slug, mô tả hoặc danh mục..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Tìm kiếm bài viết"
            />
            <Select
              size="large"
              value={status}
              onChange={(nextStatus) => {
                setStatus(nextStatus);
                setCurrentPage(1);
              }}
              aria-label="Lọc bài viết theo trạng thái"
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "draft", label: "Bản nháp" },
                { value: "scheduled", label: "Đã lên lịch" },
                { value: "published", label: "Đã xuất bản" },
              ]}
            />
          </Flex>
          <div className="admin-archive-filter">
            <Switch
              size="small"
              checked={showArchived}
              aria-label="Hiện bài viết đã lưu trữ"
              onChange={(checked) => {
                setShowArchived(checked);
                setCurrentPage(1);
              }}
            />
            <span>
              <strong>Hiện bài đã lưu trữ</strong>
              <small>Mặc định được ẩn khỏi danh sách</small>
            </span>
          </div>
        </Flex>
      </section>

      <section
        ref={tablePanelRef}
        className="admin-panel admin-table-panel admin-posts-table-panel"
        aria-label="Danh sách bài viết"
      >
        <Table<AdminPost>
          rowKey="id"
          columns={columns}
          dataSource={[...postsPage.items]}
          loading={pending || postsLoading}
          scroll={{ x: 1168, y: tableBodyHeight }}
          pagination={{
            ...adminTablePaginationDefaults,
            current: currentPage,
            pageSize,
            total: postsPage.total,
          }}
          onChange={(
            pagination,
            _filters,
            sorter: Parameters<NonNullable<TableProps<AdminPost>["onChange"]>>[2],
          ) => {
            const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
            const nextSortBy = activeSorter?.columnKey === "title"
              ? "title"
              : activeSorter?.columnKey === "status"
                ? "status"
                : activeSorter?.columnKey === "date"
                  ? "updatedAt"
                  : sortBy;
            const nextSortOrder = activeSorter?.order === "ascend" ? "asc" : "desc";
            const nextPageSize = pagination.pageSize ?? pageSize;
            const nextPage = nextPageSize !== pageSize ? 1 : (pagination.current ?? 1);
            setCurrentPage(nextPage);
            setPageSize(nextPageSize);
            setSortBy(nextSortBy);
            setSortOrder(nextSortOrder);
            void requestPage(nextPage, nextPageSize, nextSortBy, nextSortOrder);
          }}
          locale={{ emptyText: "Không có bài viết phù hợp." }}
        />
      </section>

      <AdminPostEditorModal
        open={editorOpen}
        post={editingPost}
        categories={categories}
        tags={tags}
        mediaOptions={mediaOptions}
        canPublish={canPublish}
        pending={pending}
        onCancel={() => {
          setEditorOpen(false);
          setEditingPost(null);
        }}
        onSubmit={submitPost}
      />
    </div>
  );
}
