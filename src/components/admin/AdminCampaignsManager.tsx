"use client";

import { App, Button, Form, Input, InputNumber, Select, Space, Switch, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Archive, Pencil, Plus } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { archiveCampaignAction, createCampaignAction, updateCampaignAction } from "@/actions/campaigns.actions";
import { AdminDateTimePicker } from "@/components/admin/AdminDatePickers";
import { AdminMediaPicker } from "@/components/admin/AdminMediaPicker";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminListPage } from "@/components/admin/useAdminListPage";
import { adminTablePaginationDefaults } from "@/components/admin/admin-table.config";
import type { AdminCampaign, AdminCampaignListQuery, AdminListPage, CampaignMutationInput, MediaOption } from "@/types";

interface Props { initialPage: AdminListPage<AdminCampaign, AdminCampaignListQuery["sortBy"]>; mediaOptions: readonly MediaOption[]; canWrite: boolean; canPublish: boolean; }
type FormValues = Omit<CampaignMutationInput, "rules" | "terms"> & { rulesText: string; termsText: string };
const lines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);

export function AdminCampaignsManager({ initialPage, mediaOptions, canWrite, canPublish }: Props) {
  const { message, modal } = App.useApp(); const router = useRouter(); const [form] = Form.useForm<FormValues>();
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<AdminCampaign | null>(null); const [pending, startTransition] = useTransition(); const bannerId = Form.useWatch("bannerMediaId", form); const submissionEnabled = Form.useWatch("submissionEnabled", form);
  const reportListError = useCallback((error: string) => { void message.error(error); }, [message]);
  const { data, load, loading, reload } = useAdminListPage("/api/admin/campaigns", initialPage, reportListError);
  const edit = (item: AdminCampaign | null) => { setEditing(item); form.resetFields(); form.setFieldsValue(item ? { title: item.title, slug: item.slug, description: item.description, bannerMediaId: item.bannerMediaId ?? "", startAt: item.startAt.slice(0, 16), endAt: item.endAt.slice(0, 16), status: item.status, buttonLabel: item.buttonLabel, buttonUrl: item.buttonUrl, rulesText: item.rules.join("\n"), termsText: item.terms.join("\n"), featured: item.featured, submissionEnabled: item.submissionEnabled, submissionLimit: item.submissionLimit } : { status: "draft", buttonLabel: "Tham gia ngay", featured: false, submissionEnabled: true, rulesText: "", termsText: "" }); setOpen(true); };
  const submit = (values: FormValues) => startTransition(async () => { const input: CampaignMutationInput = { ...values, startAt: new Date(values.startAt).toISOString(), endAt: new Date(values.endAt).toISOString(), buttonUrl: values.buttonUrl || null, rules: lines(values.rulesText), terms: lines(values.termsText), submissionLimit: values.submissionEnabled ? values.submissionLimit ?? null : null }; const result = editing ? await updateCampaignAction(editing.id, input) : await createCampaignAction(input); if (!result.success) { void message.error(result.message); if (result.fieldErrors) form.setFields(Object.entries(result.fieldErrors).map(([name, errors]) => ({ name: name as keyof FormValues, errors: [...errors] }))); return; } void message.success(result.message); setOpen(false); await reload(); router.refresh(); });
  const archive = (item: AdminCampaign) => modal.confirm({ title: `Lưu trữ “${item.title}”?`, okText: "Lưu trữ", cancelText: "Hủy", okButtonProps: { danger: true }, onOk: async () => { const result = await archiveCampaignAction(item.id); if (!result.success) throw new Error(result.message); void message.success(result.message); await reload(); router.refresh(); } });
  const columns: TableColumnsType<AdminCampaign> = [
    { title: "Chiến dịch", render: (_, item) => <div className="admin-table-title"><strong>{item.title}</strong><span>{item.slug}</span></div> },
    { title: "Thời gian", width: 220, render: (_, item) => <span>{new Date(item.startAt).toLocaleDateString("vi-VN")} – {new Date(item.endAt).toLocaleDateString("vi-VN")}</span> },
    { title: "Trạng thái", width: 130, render: (_, item) => <Tag color={item.status === "active" ? "success" : item.status === "upcoming" ? "gold" : "default"}>{item.status}</Tag> },
    { title: "Đăng ký", width: 110, render: (_, item) => item.submissionEnabled ? (item.submissionLimit ? `Tối đa ${item.submissionLimit}` : "Đang bật") : "Đã tắt" },
    { title: "Thao tác", width: 120, render: (_, item) => <Space><Button type="text" icon={<Pencil size={16} />} aria-label={`Sửa ${item.title}`} disabled={!canWrite || (item.status !== "draft" && !canPublish)} onClick={() => edit(item)} /><Button type="text" danger icon={<Archive size={16} />} aria-label={`Lưu trữ ${item.title}`} disabled={!canPublish} onClick={() => archive(item)} /></Space> },
  ];
  return <>
    <AdminPageHeader title="Chiến dịch" description="Quản lý chiến dịch, mốc thời gian và cấu hình nhận đăng ký bằng PostgreSQL." action={canWrite ? <Button type="primary" icon={<Plus size={17} />} onClick={() => edit(null)}>Thêm chiến dịch</Button> : undefined} />
    <section className="admin-panel admin-table-panel" aria-label="Danh sách chiến dịch"><Table rowKey="id" columns={columns} dataSource={[...data.items]} loading={pending || loading} scroll={{ x: 980 }} pagination={{ ...adminTablePaginationDefaults, current: data.page, pageSize: data.pageSize, total: data.total }} onChange={(pagination) => void load({ page: pagination.current ?? 1, pageSize: pagination.pageSize ?? data.pageSize, sortBy: data.sortBy, sortOrder: data.sortOrder })} locale={{ emptyText: "Chưa có chiến dịch." }} /></section>
    <AdminModal width={760} title={editing ? "Sửa chiến dịch" : "Tạo chiến dịch"} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} confirmLoading={pending} okText="Lưu" cancelText="Hủy" destroyOnHidden>
      <Form form={form} layout="vertical" onFinish={submit} requiredMark="optional">
        <Form.Item name="bannerMediaId" hidden rules={[{ required: true, message: "Hãy chọn banner." }]}><Input /></Form.Item><Form.Item label="Banner"><AdminMediaPicker items={mediaOptions} value={bannerId} label="Banner chiến dịch" purpose="campaign_banner" onChange={(selection) => form.setFieldValue("bannerMediaId", selection?.id ?? "")} /></Form.Item>
        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, whitespace: true }]}><Input maxLength={180} /></Form.Item><Form.Item name="slug" label="Slug"><Input placeholder="Tự sinh nếu để trống" /></Form.Item>
        <Form.Item name="description" label="Mô tả" rules={[{ required: true, whitespace: true }]}><Input.TextArea rows={4} maxLength={5000} /></Form.Item>
        <Space align="start" wrap><Form.Item name="startAt" label="Bắt đầu" rules={[{ required: true }]}><AdminDateTimePicker /></Form.Item><Form.Item name="endAt" label="Kết thúc" rules={[{ required: true }]}><AdminDateTimePicker /></Form.Item><Form.Item name="status" label="Trạng thái"><Select style={{ width: 140 }} disabled={!canPublish} options={["draft", "upcoming", "active", "ended"].map((value) => ({ value, label: value }))} /></Form.Item></Space>
        <Space align="start" wrap><Form.Item name="buttonLabel" label="Nhãn CTA" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="buttonUrl" label="URL CTA"><Input /></Form.Item></Space>
        <Form.Item name="rulesText" label="Thể lệ" extra="Mỗi dòng là một điều lệ" rules={[{ required: true, whitespace: true }]}><Input.TextArea rows={4} /></Form.Item><Form.Item name="termsText" label="Điều khoản" extra="Mỗi dòng là một điều khoản" rules={[{ required: true, whitespace: true }]}><Input.TextArea rows={4} /></Form.Item>
        <Space align="start" wrap><Form.Item name="featured" label="Nổi bật" valuePropName="checked"><Switch /></Form.Item><Form.Item name="submissionEnabled" label="Cho phép đăng ký" valuePropName="checked"><Switch /></Form.Item>{submissionEnabled ? <Form.Item name="submissionLimit" label="Giới hạn (tùy chọn)"><InputNumber min={1} /></Form.Item> : null}</Space>
      </Form>
    </AdminModal>
  </>;
}
