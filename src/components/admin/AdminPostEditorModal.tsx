"use client";

import { Form, Input, InputNumber, Select, Switch } from "antd";
import { useEffect } from "react";

import { AdminDateTimePicker } from "@/components/admin/AdminDatePickers";
import { AdminMediaPicker } from "@/components/admin/AdminMediaPicker";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPostContentEditor } from "@/components/admin/AdminPostContentEditor";
import {
  createPostContentBlock,
  validatePostContentBlocks,
} from "@/lib/post-content-blocks";
import type {
  ActionFieldErrors,
  AdminPost,
  MediaOption,
  PostContentBlock,
  PostMutationInput,
  TaxonomyItem,
} from "@/types";

interface PostFormValues {
  title: string;
  slug?: string;
  excerpt: string;
  content: PostContentBlock[];
  contentAdvancedError?: string;
  status: PostMutationInput["status"];
  featured: boolean;
  readingTime: number;
  categoryId: string;
  tagIds: string[];
  thumbnailMediaId?: string;
  coverMediaId?: string;
  scheduledAt?: string;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
}

interface AdminPostEditorModalProps {
  open: boolean;
  post: AdminPost | null;
  categories: readonly TaxonomyItem[];
  tags: readonly TaxonomyItem[];
  mediaOptions: readonly MediaOption[];
  canPublish: boolean;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (input: PostMutationInput) => Promise<ActionFieldErrors | undefined>;
}

const postFieldNames: Readonly<Record<string, keyof PostFormValues>> = {
  title: "title",
  slug: "slug",
  excerpt: "excerpt",
  content: "content",
  status: "status",
  featured: "featured",
  readingTime: "readingTime",
  categoryId: "categoryId",
  tagIds: "tagIds",
  thumbnailMediaId: "thumbnailMediaId",
  coverMediaId: "coverMediaId",
  scheduledAt: "scheduledAt",
  publishedAt: "publishedAt",
  seoTitle: "seoTitle",
  seoDescription: "seoDescription",
};

function toDateTimeLocal(value: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function AdminPostEditorModal({
  open,
  post,
  categories,
  tags,
  mediaOptions,
  canPublish,
  pending,
  onCancel,
  onSubmit,
}: AdminPostEditorModalProps) {
  const [form] = Form.useForm<PostFormValues>();
  const status = Form.useWatch("status", form);
  const thumbnailMediaId = Form.useWatch("thumbnailMediaId", form);
  const coverMediaId = Form.useWatch("coverMediaId", form);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      content: post
        ? post.content.map((block) => (
          block.type === "list" ? { ...block, items: [...block.items] } : { ...block }
        ))
        : [createPostContentBlock("paragraph")],
      contentAdvancedError: undefined,
      status: post?.status === "archived" ? "draft" : (post?.status ?? "draft"),
      featured: post?.featured ?? false,
      readingTime: post?.readingTime ?? 5,
      categoryId: post?.categoryId ?? categories[0]?.id,
      tagIds: post ? [...post.tagIds] : [],
      thumbnailMediaId: post?.thumbnailMediaId ?? undefined,
      coverMediaId: post?.coverMediaId ?? undefined,
      scheduledAt: toDateTimeLocal(post?.scheduledAt ?? null),
      publishedAt: toDateTimeLocal(post?.publishedAt ?? null),
      seoTitle: post?.seoTitle ?? "",
      seoDescription: post?.seoDescription ?? "",
    });
  }, [categories, form, open, post]);

  const submit = async (values: PostFormValues) => {
    if (values.contentAdvancedError) {
      form.setFields([{ name: "content", errors: [values.contentAdvancedError] }]);
      return;
    }

    const parsedContent = validatePostContentBlocks(values.content);
    if (!parsedContent.success) {
      form.setFields([{ name: "content", errors: [parsedContent.error] }]);
      return;
    }
    form.setFields([{ name: "content", errors: [] }]);

    const fieldErrors = await onSubmit({
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      content: parsedContent.data,
      status: values.status,
      featured: values.featured,
      readingTime: values.readingTime,
      categoryId: values.categoryId,
      tagIds: values.tagIds ?? [],
      thumbnailMediaId: values.thumbnailMediaId ?? null,
      coverMediaId: values.coverMediaId ?? null,
      scheduledAt: values.scheduledAt ? new Date(values.scheduledAt).toISOString() : null,
      publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : null,
      seoTitle: values.seoTitle || null,
      seoDescription: values.seoDescription || null,
    } as PostMutationInput);

    if (fieldErrors) {
      form.setFields(Object.entries(fieldErrors).flatMap(([name, errors]) => {
        const fieldName = postFieldNames[name];
        return fieldName ? [{ name: fieldName, errors: [...errors] }] : [];
      }));
    }
  };

  return (
    <AdminModal
      title={post ? "Chỉnh sửa bài viết" : "Tạo bài viết"}
      open={open}
      width={920}
      okText={post ? "Lưu thay đổi" : "Tạo bài viết"}
      cancelText="Hủy"
      confirmLoading={pending}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form<PostFormValues>
        form={form}
        layout="vertical"
        onFinish={(values) => void submit(values)}
        disabled={pending}
        className="admin-post-form"
      >
        <div className="admin-form-grid">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: "Vui lòng nhập tiêu đề." }]}>
            <Input
              maxLength={180}
              showCount
              placeholder="Nhập tiêu đề chính của bài viết..."
            />
          </Form.Item>
          <Form.Item name="slug" label="Slug" extra="Để trống để tự tạo từ tiêu đề.">
            <Input maxLength={180} placeholder="ten-bai-viet" />
          </Form.Item>
        </div>

        <Form.Item name="excerpt" label="Mô tả ngắn" rules={[{ required: true, message: "Vui lòng nhập mô tả." }]}>
          <Input.TextArea
            rows={3}
            maxLength={500}
            showCount
            placeholder="Tóm tắt ngắn nội dung để người đọc biết bài viết nói về điều gì..."
          />
        </Form.Item>

        <Form.Item
          name="content"
          label="Nội dung bài viết"
          required
          extra="Soạn bằng biểu mẫu trực quan hoặc chuyển sang JSON nâng cao nếu bạn cần chỉnh cấu trúc nhanh."
        >
          <AdminPostContentEditor
            mediaOptions={mediaOptions}
            disabled={pending}
            onAdvancedStateChange={(error) => {
              form.setFieldValue("contentAdvancedError", error ?? undefined);
              form.setFields([{ name: "content", errors: error ? [error] : [] }]);
            }}
          />
        </Form.Item>
        <Form.Item name="contentAdvancedError" hidden>
          <Input />
        </Form.Item>

        <div className="admin-form-grid">
          <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: "Vui lòng chọn danh mục." }]}>
            <Select
              placeholder="Chọn danh mục cho bài viết"
              options={categories.map((item) => ({ value: item.id, label: item.name }))}
            />
          </Form.Item>
          <Form.Item name="tagIds" label="Thẻ">
            <Select
              mode="multiple"
              allowClear
              placeholder="Chọn một hoặc nhiều thẻ liên quan"
              options={tags.map((item) => ({ value: item.id, label: item.name }))}
            />
          </Form.Item>
        </div>

        <div className="admin-form-grid">
          <Form.Item name="thumbnailMediaId" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="coverMediaId" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="Thumbnail" extra="Chọn ảnh đã được xác minh trong Media Library.">
            <AdminMediaPicker
              items={mediaOptions}
              value={thumbnailMediaId}
              label="Thumbnail"
              purpose="post_thumbnail"
              onChange={(selection) => form.setFieldValue("thumbnailMediaId", selection?.id)}
            />
          </Form.Item>
          <Form.Item label="Cover image">
            <AdminMediaPicker
              items={mediaOptions}
              value={coverMediaId}
              label="Cover image"
              purpose="post_cover"
              onChange={(selection) => form.setFieldValue("coverMediaId", selection?.id)}
            />
          </Form.Item>
        </div>

        <div className="admin-form-grid">
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn trạng thái bài viết"
              options={[
                { value: "draft", label: "Bản nháp" },
                ...(canPublish ? [
                  { value: "published", label: "Đã xuất bản" },
                  { value: "scheduled", label: "Lên lịch" },
                ] : []),
              ]}
            />
          </Form.Item>
          <Form.Item name="readingTime" label="Thời gian đọc (phút)" rules={[{ required: true }]}>
            <InputNumber
              min={1}
              max={999}
              className="w-full"
              placeholder="Ví dụ: 5"
            />
          </Form.Item>
        </div>

        {status === "scheduled" ? (
          <Form.Item name="scheduledAt" label="Thời gian lên lịch" rules={[{ required: true, message: "Vui lòng chọn thời gian lên lịch." }]}>
            <AdminDateTimePicker placeholder="Chọn ngày và giờ lên lịch" />
          </Form.Item>
        ) : null}
        {status === "published" ? (
          <Form.Item name="publishedAt" label="Thời gian xuất bản" extra="Để trống để dùng thời điểm lưu.">
            <AdminDateTimePicker placeholder="Chọn ngày và giờ xuất bản (không bắt buộc)" />
          </Form.Item>
        ) : null}

        <Form.Item name="featured" label="Bài viết nổi bật" valuePropName="checked">
          <Switch />
        </Form.Item>

        <div className="admin-form-grid">
          <Form.Item name="seoTitle" label="SEO title">
            <Input
              maxLength={70}
              showCount
              placeholder="Tiêu đề hiển thị trên kết quả tìm kiếm..."
            />
          </Form.Item>
          <Form.Item name="seoDescription" label="SEO description">
            <Input.TextArea
              rows={3}
              maxLength={180}
              showCount
              placeholder="Mô tả ngắn giúp người dùng hiểu nội dung trước khi truy cập..."
            />
          </Form.Item>
        </div>
      </Form>
    </AdminModal>
  );
}
