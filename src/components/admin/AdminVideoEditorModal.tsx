"use client";

import { Form, Input, Modal, Select, Switch } from "antd";
import { useEffect } from "react";

import { AdminMediaPicker } from "@/components/admin/AdminMediaPicker";
import type {
  ActionFieldErrors,
  AdminVideo,
  MediaOption,
  VideoMutationInput,
} from "@/types";

interface VideoFormValues {
  title: string;
  description?: string;
  platform: VideoMutationInput["platform"];
  orientation: VideoMutationInput["orientation"];
  topic: string;
  externalUrl?: string;
  thumbnailMediaId?: string;
  featured: boolean;
}

interface AdminVideoEditorModalProps {
  open: boolean;
  video: AdminVideo | null;
  mediaOptions: readonly MediaOption[];
  pending: boolean;
  onCancel: () => void;
  onSubmit: (input: VideoMutationInput) => Promise<ActionFieldErrors | undefined>;
}

const fieldNames: Readonly<Record<string, keyof VideoFormValues>> = {
  title: "title",
  description: "description",
  platform: "platform",
  orientation: "orientation",
  topic: "topic",
  externalUrl: "externalUrl",
  thumbnailMediaId: "thumbnailMediaId",
  featured: "featured",
};

export function AdminVideoEditorModal({
  open,
  video,
  mediaOptions,
  pending,
  onCancel,
  onSubmit,
}: AdminVideoEditorModalProps) {
  const [form] = Form.useForm<VideoFormValues>();
  const platform = Form.useWatch("platform", form);
  const thumbnailMediaId = Form.useWatch("thumbnailMediaId", form);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      title: video?.title ?? "",
      description: video?.description ?? "",
      platform: video?.platform ?? "youtube",
      orientation: video?.orientation ?? "landscape",
      topic: video?.topic ?? "",
      externalUrl: video?.externalUrl ?? "",
      thumbnailMediaId: video?.thumbnailMediaId ?? undefined,
      featured: video?.featured ?? false,
    });
  }, [form, open, video]);

  const submit = async (values: VideoFormValues) => {
    const errors = await onSubmit({
      title: values.title,
      description: values.description || null,
      platform: values.platform,
      orientation: values.orientation,
      topic: values.topic,
      externalUrl: values.platform === "internal" ? null : values.externalUrl || null,
      thumbnailMediaId: values.thumbnailMediaId ?? null,
      featured: values.featured,
    });
    if (errors) {
      form.setFields(Object.entries(errors).flatMap(([name, messages]) => {
        const fieldName = fieldNames[name];
        return fieldName ? [{ name: fieldName, errors: [...messages] }] : [];
      }));
    }
  };

  return (
    <Modal
      title={video ? "Chỉnh sửa video" : "Thêm video nền tảng ngoài"}
      open={open}
      width={760}
      okText={video ? "Lưu thay đổi" : "Thêm video"}
      cancelText="Hủy"
      confirmLoading={pending}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form<VideoFormValues>
        form={form}
        layout="vertical"
        disabled={pending}
        className="admin-video-form"
        onFinish={(values) => void submit(values)}
      >
        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: "Vui lòng nhập tiêu đề." }]}>
          <Input maxLength={180} showCount />
        </Form.Item>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} maxLength={2000} showCount />
        </Form.Item>
        <div className="admin-form-grid">
          <Form.Item name="platform" label="Nền tảng" rules={[{ required: true }]}>
            <Select
              disabled={video?.platform === "internal"}
              options={video?.platform === "internal"
                ? [{ value: "internal", label: "Mux" }]
                : [
                    { value: "youtube", label: "YouTube" },
                    { value: "tiktok", label: "TikTok" },
                    { value: "instagram", label: "Instagram" },
                    { value: "facebook", label: "Facebook" },
                  ]}
            />
          </Form.Item>
          <Form.Item name="orientation" label="Hướng video" rules={[{ required: true }]}>
            <Select options={[
              { value: "landscape", label: "Landscape (16:9)" },
              { value: "portrait", label: "Portrait (9:16)" },
            ]} />
          </Form.Item>
        </div>
        <Form.Item name="topic" label="Chủ đề" rules={[{ required: true, message: "Vui lòng nhập chủ đề." }]}>
          <Input maxLength={100} />
        </Form.Item>
        {platform !== "internal" ? (
          <Form.Item
            name="externalUrl"
            label="URL video"
            rules={[
              { required: true, message: "Vui lòng nhập URL video." },
              { type: "url", message: "URL chưa hợp lệ." },
            ]}
          >
            <Input type="url" placeholder="https://..." />
          </Form.Item>
        ) : null}
        <Form.Item label="Thumbnail" extra="Nếu để trống, video Mux dùng thumbnail do Mux tạo.">
          <AdminMediaPicker
            items={mediaOptions}
            value={thumbnailMediaId}
            label="Thumbnail"
            onChange={(selection) => form.setFieldValue("thumbnailMediaId", selection?.id)}
          />
        </Form.Item>
        <Form.Item name="featured" label="Video nổi bật" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
