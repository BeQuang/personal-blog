"use client";

import { App, Button, Flex, Input, Select, Space, Switch, Table, Tag, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { Archive, EyeOff, Pencil, Plus, Search, Send } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
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
import { adminStatusColors, adminStatusLabels, formatAdminDate } from "@/components/admin/admin-table.config";
import type {
  ActionFieldErrors,
  AdminPost,
  MediaOption,
  PostMutationInput,
  TaxonomyItem,
} from "@/types";

interface AdminPostsManagerProps {
  posts: readonly AdminPost[];
  categories: readonly TaxonomyItem[];
  tags: readonly TaxonomyItem[];
  mediaOptions: readonly MediaOption[];
  canWrite: boolean;
  canPublish: boolean;
}

export function AdminPostsManager({
  posts,
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
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);
  const [pending, startTransition] = useTransition();

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi-VN");
    return posts.filter((post) => {
      const matchesQuery = !normalizedQuery || [post.title, post.excerpt, post.categoryName, post.slug]
        .some((value) => value.toLocaleLowerCase("vi-VN").includes(normalizedQuery));
      return matchesQuery && (status === "all" || post.status === status);
    });
  }, [posts, query, status]);

  const runResult = async (operation: () => Promise<{ success: boolean; message: string }>) => {
    const result = await operation();
    if (result.success) {
      void message.success(result.message);
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
        router.refresh();
      },
    });
  };

  const columns: TableColumnsType<AdminPost> = [
    {
      title: "Bài viết",
      key: "title",
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
        router.refresh();
        resolve(undefined);
      });
    });

  return (
    <>
      <AdminPageHeader
        title="Bài viết"
        description="Quản lý bài viết, lịch xuất bản, category, tag và SEO bằng dữ liệu PostgreSQL thật."
        action={
          <Flex gap={8} wrap>
            <AdminTaxonomyManager type="category" label="Danh mục" items={categories} canWrite={canWrite} />
            <AdminTaxonomyManager type="tag" label="Thẻ" items={tags} canWrite={canWrite} />
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

      <section className="admin-panel admin-table-panel" aria-label="Danh sách bài viết">
        <Flex className="admin-table-toolbar" gap={12} wrap>
          <Input
            allowClear
            prefix={<Search size={17} aria-hidden="true" />}
            placeholder="Tìm theo tiêu đề, slug, mô tả hoặc danh mục..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Tìm kiếm bài viết"
          />
          <Select
            value={status}
            onChange={setStatus}
            aria-label="Lọc bài viết theo trạng thái"
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "draft", label: "Bản nháp" },
              { value: "scheduled", label: "Đã lên lịch" },
              { value: "published", label: "Đã xuất bản" },
              { value: "archived", label: "Đã lưu trữ" },
            ]}
          />
        </Flex>
        <Table<AdminPost>
          rowKey="id"
          columns={columns}
          dataSource={[...filteredPosts]}
          loading={pending}
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 8, showSizeChanger: false }}
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
    </>
  );
}
