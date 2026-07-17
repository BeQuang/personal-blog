"use client";

import { App, Alert, Button, Card, Form, Input, Space } from "antd";
import { RotateCcw, Save } from "lucide-react";
import { useState } from "react";

import { AdminMediaPicker } from "@/components/admin/AdminMediaPicker";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { siteConfig } from "@/config/site.config";
import type { AdminSiteSettings, MediaOption } from "@/types";

const initialValues: AdminSiteSettings = {
  siteName: siteConfig.siteName,
  siteDescription: siteConfig.siteDescription,
  email: siteConfig.contactEmail,
  avatarUrl: siteConfig.avatar ?? "",
  coverUrl: siteConfig.coverImage ?? "",
  defaultSeoTitle: siteConfig.siteName,
  defaultSeoDescription: siteConfig.siteDescription,
};

interface AdminSettingsFormProps {
  mediaOptions: readonly MediaOption[];
}

export function AdminSettingsForm({ mediaOptions }: AdminSettingsFormProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<AdminSiteSettings>();
  const [saving, setSaving] = useState(false);
  const avatarUrl = Form.useWatch("avatarUrl", form);
  const coverUrl = Form.useWatch("coverUrl", form);
  const avatarMediaId = mediaOptions.find((item) => item.publicUrl === avatarUrl)?.id;
  const coverMediaId = mediaOptions.find((item) => item.publicUrl === coverUrl)?.id;

  const submit = async () => {
    setSaving(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 550));
    setSaving(false);
    void message.success("Đã mô phỏng lưu cài đặt. Không có dữ liệu nào được gửi đi.");
  };

  const reset = () => {
    form.resetFields();
    void message.success("Đã khôi phục giá trị mock ban đầu.");
  };

  return (
    <>
      <AdminPageHeader
        title="Cài đặt"
        description="Thông tin website và SEO mặc định cho bản demo. Form không gọi API và không ghi dữ liệu production."
      />
      <Alert
        type="warning"
        showIcon
        title="Admin Dashboard demo"
        description="Nút lưu chỉ hiển thị phản hồi mô phỏng; thay đổi sẽ mất khi tải lại trang."
        className="admin-settings-alert"
      />
      <Card className="admin-settings-card admin-settings-form-card">
        <Form<AdminSiteSettings>
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={submit}
          requiredMark="optional"
          scrollToFirstError
        >
          <div className="admin-form-grid">
            <Form.Item name="siteName" label="Tên website" rules={[{ required: true, whitespace: true, message: "Vui lòng nhập tên website." }, { max: 80, message: "Tên website tối đa 80 ký tự." }]}>
              <Input placeholder="Tên website" maxLength={80} showCount />
            </Form.Item>
            <Form.Item name="email" label="Email liên hệ" rules={[{ required: true, message: "Vui lòng nhập email." }, { type: "email", message: "Email chưa đúng định dạng." }]}>
              <Input type="email" placeholder="hello@example.com" />
            </Form.Item>
          </div>
          <Form.Item name="siteDescription" label="Mô tả website" rules={[{ required: true, whitespace: true, message: "Vui lòng nhập mô tả website." }, { max: 240, message: "Mô tả tối đa 240 ký tự." }]}>
            <Input.TextArea rows={3} maxLength={240} showCount placeholder="Mô tả ngắn về website" />
          </Form.Item>
          <div className="admin-form-grid">
            <Form.Item name="avatarUrl" hidden rules={[{ required: true, whitespace: true, message: "Vui lòng chọn Avatar." }]}>
              <Input />
            </Form.Item>
            <Form.Item name="coverUrl" hidden rules={[{ required: true, whitespace: true, message: "Vui lòng chọn Cover." }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Avatar" extra={avatarUrl || "Chọn ảnh từ Media Library."}>
              <AdminMediaPicker
                items={mediaOptions}
                value={avatarMediaId}
                label="Avatar"
                onChange={(selection) => form.setFieldValue("avatarUrl", selection?.publicUrl ?? "")}
              />
            </Form.Item>
            <Form.Item label="Cover / banner" extra={coverUrl || "Chọn ảnh từ Media Library."}>
              <AdminMediaPicker
                items={mediaOptions}
                value={coverMediaId}
                label="Cover / banner"
                onChange={(selection) => form.setFieldValue("coverUrl", selection?.publicUrl ?? "")}
              />
            </Form.Item>
          </div>
          <Form.Item name="defaultSeoTitle" label="SEO title mặc định" rules={[{ required: true, whitespace: true, message: "Vui lòng nhập SEO title." }, { max: 70, message: "SEO title nên tối đa 70 ký tự." }]}>
            <Input maxLength={70} showCount placeholder="Tiêu đề mặc định trên công cụ tìm kiếm" />
          </Form.Item>
          <Form.Item name="defaultSeoDescription" label="SEO description mặc định" rules={[{ required: true, whitespace: true, message: "Vui lòng nhập SEO description." }, { max: 170, message: "SEO description nên tối đa 170 ký tự." }]}>
            <Input.TextArea rows={3} maxLength={170} showCount placeholder="Mô tả mặc định trên công cụ tìm kiếm" />
          </Form.Item>
          <Space wrap>
            <Button type="primary" htmlType="submit" loading={saving} icon={<Save aria-hidden="true" size={16} />}>
              Lưu cài đặt demo
            </Button>
            <Button onClick={reset} disabled={saving} icon={<RotateCcw aria-hidden="true" size={16} />}>
              Khôi phục
            </Button>
          </Space>
        </Form>
      </Card>
    </>
  );
}
