"use client";

import { Alert, Form, Input, InputNumber, Select, Switch } from "antd";
import { useEffect } from "react";

import { AdminModal } from "@/components/admin/AdminModal";
import type {
  ActionFieldErrors,
  SocialLink,
  SocialLinkMutationInput,
  SocialPlatform,
} from "@/types";
import {
  getSocialAudienceConfig,
  SOCIAL_DESCRIPTION_MAX_LENGTH,
  TIKTOK_AUTOMATION_ENABLED,
} from "@/utils/social-audience";

interface SocialFormValues {
  platform: SocialPlatform;
  label: string;
  username?: string;
  url: string;
  followerCount?: number;
  likesCount?: number;
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
  likesCount: "likesCount",
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
  const selectedPlatform = Form.useWatch("platform", form) ?? link?.platform ?? "facebook";
  const audienceConfig = getSocialAudienceConfig(selectedPlatform);
  const isContactPlatform = selectedPlatform === "email" || selectedPlatform === "website";
  const isTikTokConnected = TIKTOK_AUTOMATION_ENABLED
    && selectedPlatform === "tiktok"
    && link?.platform === "tiktok"
    && link.audienceSource === "tiktok_api";
  const urlPlaceholder = selectedPlatform === "email"
    ? "Ví dụ: mailto:hello@example.com"
    : selectedPlatform === "youtube"
      ? "Ví dụ: https://youtube.com/@tenkenh"
      : selectedPlatform === "discord"
        ? "Ví dụ: https://discord.gg/ma-moi"
        : `Ví dụ: https://platform.com/${selectedPlatform === "website" ? "" : "username"}`;
  const youtubeLastSyncedLabel = link?.audienceLastSyncedAt
    ? `Đồng bộ gần nhất: ${new Date(link.audienceLastSyncedAt).toLocaleString("vi-VN")}`
    : null;

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      platform: link?.platform ?? "facebook",
      label: link?.label ?? "",
      username: link?.username ?? "",
      url: link?.url ?? "",
      followerCount: link?.followerCount,
      likesCount: link?.likesCount,
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
      likesCount: values.likesCount ?? null,
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
      width={760}
      open={open}
      okText={link ? "Lưu thay đổi" : "Tạo social link"}
      cancelText="Hủy"
      confirmLoading={pending}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form<SocialFormValues>
        form={form}
        layout="vertical"
        onFinish={(values) => void submit(values)}
        disabled={pending}
        className="admin-social-link-form"
      >
        <div className="admin-form-grid">
          <Form.Item name="platform" label="Platform" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn nền tảng mạng xã hội"
              options={platformOptions}
            />
          </Form.Item>
          <Form.Item name="label" label="Tên hiển thị" rules={[{ required: true, message: "Vui lòng nhập tên hiển thị." }]}>
            <Input
              maxLength={80}
              placeholder="Ví dụ: Facebook Quang Official"
            />
          </Form.Item>
        </div>
        <Form.Item
          name="url"
          label={selectedPlatform === "email" ? "Địa chỉ email (mailto)" : "URL"}
          rules={[{ required: true, message: "Vui lòng nhập URL." }]}
          extra={(
            <span className="admin-social-link-field-note">
              {selectedPlatform === "youtube"
                ? "Dùng URL /@handle hoặc /channel/CHANNEL_ID để đồng bộ chính xác."
                : selectedPlatform === "discord"
                  ? "Dùng liên kết mời hoặc liên kết máy chủ Discord."
                  : "Email dùng mailto:name@example.com; các platform khác dùng http/https."}
            </span>
          )}
        >
          <Input
            maxLength={500}
            placeholder={urlPlaceholder}
            disabled={isTikTokConnected}
          />
        </Form.Item>
        <div className={selectedPlatform === "tiktok"
          ? "admin-social-tiktok-stats-grid"
          : audienceConfig.label
            ? "admin-form-grid"
            : undefined}
        >
          {!isContactPlatform && (
          <Form.Item name="username" label={selectedPlatform === "youtube" ? "Handle kênh" : "Username"}>
            <Input
              maxLength={120}
              placeholder={selectedPlatform === "youtube" ? "Ví dụ: @quangofficial" : "Ví dụ: @username"}
              disabled={isTikTokConnected}
            />
          </Form.Item>
          )}
          {audienceConfig.label && (
          <Form.Item
            name="followerCount"
            label={audienceConfig.label}
            extra={(
              <span className="admin-social-link-field-note">
                {isTikTokConnected ? "Tự động đồng bộ từ TikTok." : audienceConfig.help}
              </span>
            )}
          >
            <InputNumber
              min={0}
              precision={0}
              style={{ width: "100%" }}
              placeholder={audienceConfig.placeholder ?? undefined}
              disabled={!audienceConfig.editable || isTikTokConnected}
            />
          </Form.Item>
          )}
          {selectedPlatform === "tiktok" && (
          <Form.Item
            name="likesCount"
            label="Tổng lượt thích"
            extra={(
              <span className="admin-social-link-field-note">
                {isTikTokConnected
                  ? "Tự động đồng bộ từ TikTok."
                  : "Nhập tổng lượt thích đang hiển thị."}
              </span>
            )}
          >
            <InputNumber
              min={0}
              precision={0}
              style={{ width: "100%" }}
              placeholder="Ví dụ: 2400000"
              disabled={isTikTokConnected}
            />
          </Form.Item>
          )}
        </div>
        {selectedPlatform === "youtube" && (
          <Alert
            type={link?.audienceSyncStatus === "error" ? "warning" : "info"}
            showIcon
            title={link?.audienceSyncError
              ? link.audienceSyncError
              : link?.audienceSyncStatus === "synced" && youtubeLastSyncedLabel
                ? (
                  <span className="admin-social-link-sync-line">
                    <strong>Số người đăng ký đang được quản lý tự động.</strong>
                    <span>{youtubeLastSyncedLabel}</span>
                  </span>
                )
                : "YouTube sẽ được xác minh và lấy số người đăng ký ngay khi lưu."}
            className="admin-form-alert"
            styles={{
              root: { marginBottom: 16, padding: "9px 12px" },
              icon: { fontSize: 15, marginInlineEnd: 8 },
              title: { fontSize: 12, fontWeight: 400, lineHeight: 1.4 },
            }}
          />
        )}
        {selectedPlatform === "tiktok" && (
          <Alert
            type="info"
            showIcon
            title="Đồng bộ tự động TikTok đang tạm tắt. Hãy nhập số người theo dõi và tổng lượt thích thủ công."
            className="admin-form-alert"
            styles={{
              root: { marginBottom: 16, padding: "9px 12px" },
              icon: { fontSize: 15, marginInlineEnd: 8 },
              title: { fontSize: 12, fontWeight: 400, lineHeight: 1.4 },
            }}
          />
        )}
        <div className="admin-form-grid">
          <Form.Item name="order" label="Thứ tự" rules={[{ required: true }]}>
            <InputNumber
              min={0}
              precision={0}
              className="w-full"
              placeholder="Ví dụ: 1"
            />
          </Form.Item>
          <Form.Item name="enabled" label="Hiển thị public" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea
            rows={4}
            maxLength={SOCIAL_DESCRIPTION_MAX_LENGTH}
            showCount
            placeholder="Mô tả ngắn về nội dung hoặc mục đích của kênh..."
          />
        </Form.Item>
      </Form>
    </AdminModal>
  );
}
