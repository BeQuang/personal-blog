"use client";

import { App, Button, Card, Form, Input, Space } from "antd";
import { Save } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateSiteSettingsAction } from "@/actions/settings.actions";
import { AdminMediaPicker } from "@/components/admin/AdminMediaPicker";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import type { MediaOption, SiteSettingsMutationInput } from "@/types";

interface Props { initialSettings: SiteSettingsMutationInput; mediaOptions: readonly MediaOption[]; }

export function AdminSettingsForm({ initialSettings, mediaOptions }: Props) {
  const { message } = App.useApp(); const router = useRouter(); const [form] = Form.useForm<SiteSettingsMutationInput>(); const [pending, startTransition] = useTransition();
  const avatarMediaId = Form.useWatch("avatarMediaId", form); const coverMediaId = Form.useWatch("coverMediaId", form);
  const submit = (values: SiteSettingsMutationInput) => startTransition(async () => { const input = { ...initialSettings, ...values, theme: initialSettings.theme, homepageSections: initialSettings.homepageSections, navigation: initialSettings.navigation }; const result = await updateSiteSettingsAction(input); if (!result.success) { void message.error(result.message); if (result.fieldErrors) form.setFields(Object.entries(result.fieldErrors).map(([name, errors]) => ({ name: name as keyof SiteSettingsMutationInput, errors: [...errors] }))); return; } void message.success(result.message); router.refresh(); });
  return <>
    <AdminPageHeader title="Cài đặt" description="Thông tin website, creator, ảnh đại diện và SEO mặc định được lưu trong PostgreSQL." />
    <Card className="admin-settings-card admin-settings-form-card">
      <Form form={form} layout="vertical" initialValues={initialSettings} onFinish={submit} requiredMark="optional" scrollToFirstError>
        <div className="admin-form-grid"><Form.Item name="siteName" label="Tên website" rules={[{ required: true, whitespace: true }]}><Input maxLength={100} /></Form.Item><Form.Item name="contactEmail" label="Email liên hệ" rules={[{ required: true }, { type: "email" }]}><Input type="email" /></Form.Item></div>
        <Form.Item name="siteDescription" label="Mô tả website" rules={[{ required: true, whitespace: true }]}><Input.TextArea rows={3} maxLength={300} /></Form.Item>
        <div className="admin-form-grid"><Form.Item name="creatorName" label="Tên creator" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item><Form.Item name="username" label="Username" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item></div>
        <Form.Item name="avatarMediaId" hidden><Input /></Form.Item><Form.Item name="coverMediaId" hidden><Input /></Form.Item>
        <div className="admin-form-grid"><Form.Item label="Avatar"><AdminMediaPicker items={mediaOptions} value={avatarMediaId ?? undefined} label="Avatar" onChange={(selection) => form.setFieldValue("avatarMediaId", selection?.id ?? null)} /></Form.Item><Form.Item label="Cover / social image"><AdminMediaPicker items={mediaOptions} value={coverMediaId ?? undefined} label="Cover" onChange={(selection) => form.setFieldValue("coverMediaId", selection?.id ?? null)} /></Form.Item></div>
        <Form.Item name="defaultSeoTitle" label="SEO title mặc định" rules={[{ required: true, whitespace: true }]}><Input maxLength={100} /></Form.Item><Form.Item name="defaultSeoDescription" label="SEO description mặc định" rules={[{ required: true, whitespace: true }]}><Input.TextArea rows={3} maxLength={300} /></Form.Item>
        <p className="admin-preview-note">Cover được dùng làm ảnh Open Graph mặc định khi route không có ảnh riêng. Theme và section trang chủ được quản lý tại trang Giao diện.</p>
        <Space><Button type="primary" htmlType="submit" loading={pending} icon={<Save size={16} />}>Lưu cài đặt</Button><Button onClick={() => form.resetFields()} disabled={pending}>Khôi phục bản đã tải</Button></Space>
      </Form>
    </Card>
  </>;
}
