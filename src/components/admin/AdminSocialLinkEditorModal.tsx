"use client";

import { Form, Input, InputNumber, Select, Switch } from "antd";
import { useEffect } from "react";

import { AdminModal } from "@/components/admin/AdminModal";
import type {
  ActionFieldErrors,
  SocialLink,
  SocialLinkMutationInput,
  SocialPlatform,
} from "@/types";

interface SocialFormValues {
  platform: SocialPlatform;
  label: string;
  username?: string;
  url: string;
  followerCount?: number;
  description?: string;
  enabled: boolean;
  order: number;
}

interface AdminSocialLinkEditorModalProps {
  open: boolean;
  link: SocialLink | null;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (input: SocialLinkMutationInput) => Promise<ActionFieldErrors | undefined>;
}

const platformOptions: { value: SocialPlatform; label: string }[] = [
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

const socialFieldNames: Readonly<Record<string, keyof SocialFormValues>> = {
  platform: "platform",
  label: "label",
  username: "username",
  url: "url",
  followerCount: "followerCount",
  description: "description",
  enabled: "enabled",
  order: "order",
};

export function AdminSocialLinkEditorModal({
  open,
  link,
  pending,
  onCancel,
  onSubmit,
}: AdminSocialLinkEditorModalProps) {
  const [form] = Form.useForm<SocialFormValues>();

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      platform: link?.platform ?? "facebook",
      label: link?.label ?? "",
      username: link?.username ?? "",
      url: link?.url ?? "",
      followerCount: link?.followerCount,
      description: link?.description ?? "",
      enabled: link?.enabled ?? true,
      order: link?.order ?? 0,
    });
  }, [form, link, open]);

  const submit = async (values: SocialFormValues) => {
    const errors = await onSubmit({
      platform: values.platform,
      label: values.label,
      username: values.username || null,
      url: values.url,
      followerCount: values.followerCount ?? null,
      description: values.description || null,
      enabled: values.enabled,
      order: values.order,
    });
    if (errors) {
      form.setFields(Object.entries(errors).flatMap(([name, fieldErrors]) => {
        const fieldName = socialFieldNames[name];
        return fieldName ? [{ name: fieldName, errors: [...fieldErrors] }] : [];
      }));
    }
  };

  return (
    <AdminModal
      title={link ? "Chỉnh sửa social link" : "Tạo social link"}
      open={open}
      okText={link ? "Lưu thay đổi" : "Tạo social link"}
      cancelText="Hủy"
      confirmLoading={pending}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form<SocialFormValues> form={form} layout="vertical" onFinish={(values) => void submit(values)} disabled={pending}>
        <div className="admin-form-grid">
          <Form.Item name="platform" label="Platform" rules={[{ required: true }]}>
            <Select options={platformOptions} />
          </Form.Item>
          <Form.Item name="label" label="Tên hiển thị" rules={[{ required: true, message: "Vui lòng nhập tên hiển thị." }]}>
            <Input maxLength={80} />
          </Form.Item>
        </div>
        <Form.Item name="url" label="URL" rules={[{ required: true, message: "Vui lòng nhập URL." }]} extra="Email dùng mailto:name@example.com; các platform khác dùng http/https.">
          <Input maxLength={500} />
        </Form.Item>
        <div className="admin-form-grid">
          <Form.Item name="username" label="Username">
            <Input maxLength={120} />
          </Form.Item>
          <Form.Item name="followerCount" label="Follower count">
            <InputNumber min={0} precision={0} className="w-full" />
          </Form.Item>
        </div>
        <div className="admin-form-grid">
          <Form.Item name="order" label="Thứ tự" rules={[{ required: true }]}>
            <InputNumber min={0} precision={0} className="w-full" />
          </Form.Item>
          <Form.Item name="enabled" label="Hiển thị public" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} maxLength={300} showCount />
        </Form.Item>
      </Form>
    </AdminModal>
  );
}
