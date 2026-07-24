"use client";

import { Form, Input, InputNumber, Select, Switch } from "antd";
import { useEffect } from "react";

import { AdminDateTimePicker } from "@/components/admin/AdminDatePickers";
import { AdminMediaPicker } from "@/components/admin/AdminMediaPicker";
import { AdminModal } from "@/components/admin/AdminModal";
import type {
  ActionFieldErrors,
  AdminPost,
  MediaOption,
  PostMutationInput,
  TaxonomyItem,
} from "@/types";

interface PostFormValues {
  title: string;
  slug?: string;
  excerpt: string;
  contentJson: string;
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

const starterContent = JSON.stringify(
  [{ type: "paragraph", text: "Nhập nội dung bài viết tại đây." }],
  null,
  2,
);

const postFieldNames: Readonly<Record<string, keyof PostFormValues>> = {
  title: "title",
  slug: "slug",
  excerpt: "excerpt",
  content: "contentJson",
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
      contentJson: post ? JSON.stringify(post.content, null, 2) : starterContent,
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
    let content: unknown;
    try {
      content = JSON.parse(values.contentJson);
    } catch {
      form.setFields([{ name: "contentJson", errors: ["JSON content blocks không hợp lệ."] }]);
      return;
    }

    if (!Array.isArray(content)) {
      form.setFields([{ name: "contentJson", errors: ["Content blocks phải là một JSON array."] }]);
      return;
    }

    const fieldErrors = await onSubmit({
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      content,
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
            <Input maxLength={180} showCount />
          </Form.Item>
          <Form.Item name="slug" label="Slug" extra="Để trống để tự tạo từ tiêu đề.">
            <Input maxLength={180} placeholder="ten-bai-viet" />
          </Form.Item>
        </div>

        <Form.Item name="excerpt" label="Mô tả ngắn" rules={[{ required: true, message: "Vui lòng nhập mô tả." }]}>
          <Input.TextArea rows={3} maxLength={500} showCount />
        </Form.Item>

        <Form.Item
          name="contentJson"
          label="Content blocks (JSON)"
          rules={[{ required: true, message: "Vui lòng nhập content blocks." }]}
          extra='Hỗ trợ: heading, paragraph, image, quote, list, code, video, cta và divider. Dữ liệu được Zod kiểm tra lại trên server.'
        >
          <Input.TextArea rows={14} className="admin-code-input" spellCheck={false} />
        </Form.Item>

        <div className="admin-form-grid">
          <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: "Vui lòng chọn danh mục." }]}>
            <Select options={categories.map((item) => ({ value: item.id, label: item.name }))} />
          </Form.Item>
          <Form.Item name="tagIds" label="Thẻ">
            <Select mode="multiple" allowClear options={tags.map((item) => ({ value: item.id, label: item.name }))} />
          </Form.Item>
        </div>

        <div className="admin-form-grid">
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
            <InputNumber min={1} max={999} className="w-full" />
          </Form.Item>
        </div>

        {status === "scheduled" ? (
          <Form.Item name="scheduledAt" label="Thời gian lên lịch" rules={[{ required: true, message: "Vui lòng chọn thời gian lên lịch." }]}>
            <AdminDateTimePicker />
          </Form.Item>
        ) : null}
        {status === "published" ? (
          <Form.Item name="publishedAt" label="Thời gian xuất bản" extra="Để trống để dùng thời điểm lưu.">
            <AdminDateTimePicker />
          </Form.Item>
        ) : null}

        <Form.Item name="featured" label="Bài viết nổi bật" valuePropName="checked">
          <Switch />
        </Form.Item>

        <div className="admin-form-grid">
          <Form.Item name="seoTitle" label="SEO title">
            <Input maxLength={70} showCount />
          </Form.Item>
          <Form.Item name="seoDescription" label="SEO description">
            <Input.TextArea rows={3} maxLength={180} showCount />
          </Form.Item>
        </div>
      </Form>
    </AdminModal>
  );
}
