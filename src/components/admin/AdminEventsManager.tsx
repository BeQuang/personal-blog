"use client";

import { App, Button, Form, Input, Modal, Select, Space, Switch, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Archive, Pencil, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { archiveEventAction, createEventAction, updateEventAction } from "@/actions/events.actions";
import { AdminMediaPicker } from "@/components/admin/AdminMediaPicker";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import type { AdminEvent, EventMutationInput, MediaOption } from "@/types";

interface Props { events: readonly AdminEvent[]; mediaOptions: readonly MediaOption[]; canWrite: boolean; canPublish: boolean; }
type FormValues = Omit<EventMutationInput, "schedule"> & { scheduleText?: string };
const eventTypes = ["livestream", "premiere", "fan-meeting", "giveaway", "workshop", "offline", "launch"] as const;

function localDate(value: string | null) { return value ? value.slice(0, 16) : undefined; }
function parseSchedule(value?: string) { return (value ?? "").split("\n").map((line) => line.trim()).filter(Boolean).map((line) => { const [time, ...title] = line.split("|"); return { time: time.trim(), title: title.join("|").trim() }; }).filter((item) => item.time && item.title); }

export function AdminEventsManager({ events, mediaOptions, canWrite, canPublish }: Props) {
  const { message, modal } = App.useApp(); const router = useRouter(); const [form] = Form.useForm<FormValues>();
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<AdminEvent | null>(null); const [pending, startTransition] = useTransition(); const bannerId = Form.useWatch("bannerMediaId", form);
  const edit = (event: AdminEvent | null) => { setEditing(event); form.resetFields(); form.setFieldsValue(event ? { title: event.title, slug: event.slug, description: event.description, bannerMediaId: event.bannerMediaId ?? "", type: event.type, eventStatus: event.eventStatus, contentStatus: event.contentStatus, startAt: localDate(event.startAt) ?? "", endAt: localDate(event.endAt), timezone: event.timezone, location: event.location, platform: event.platform, externalUrl: event.externalUrl, scheduleText: event.schedule.map((item) => `${item.time}|${item.title}`).join("\n"), featured: event.featured } : { timezone: "Asia/Ho_Chi_Minh", type: "offline", eventStatus: "upcoming", contentStatus: "draft", featured: false }); setOpen(true); };
  const submit = (values: FormValues) => startTransition(async () => { const input: EventMutationInput = { ...values, startAt: new Date(values.startAt).toISOString(), endAt: values.endAt ? new Date(values.endAt).toISOString() : null, location: values.location || null, platform: values.platform || null, externalUrl: values.externalUrl || null, schedule: parseSchedule(values.scheduleText) }; const result = editing ? await updateEventAction(editing.id, input) : await createEventAction(input); if (!result.success) { void message.error(result.message); if (result.fieldErrors) form.setFields(Object.entries(result.fieldErrors).map(([name, errors]) => ({ name: name as keyof FormValues, errors: [...errors] }))); return; } void message.success(result.message); setOpen(false); router.refresh(); });
  const archive = (event: AdminEvent) => modal.confirm({ title: `Lưu trữ “${event.title}”?`, okText: "Lưu trữ", cancelText: "Hủy", okButtonProps: { danger: true }, onOk: async () => { const result = await archiveEventAction(event.id); if (!result.success) throw new Error(result.message); void message.success(result.message); router.refresh(); } });
  const columns: TableColumnsType<AdminEvent> = [
    { title: "Sự kiện", render: (_, event) => <div className="admin-table-title"><strong>{event.title}</strong><span>{event.slug}</span></div> },
    { title: "Thời gian", width: 190, render: (_, event) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short", timeZone: event.timezone }).format(new Date(event.startAt)) },
    { title: "Trạng thái", width: 180, render: (_, event) => <Space><Tag color={event.contentStatus === "published" ? "success" : "default"}>{event.contentStatus}</Tag><Tag>{event.eventStatus}</Tag></Space> },
    { title: "Thao tác", width: 120, render: (_, event) => <Space><Button type="text" icon={<Pencil size={16} />} aria-label={`Sửa ${event.title}`} disabled={!canWrite || (event.contentStatus !== "draft" && !canPublish)} onClick={() => edit(event)} /><Button type="text" danger icon={<Archive size={16} />} aria-label={`Lưu trữ ${event.title}`} disabled={!canPublish || event.contentStatus === "archived"} onClick={() => archive(event)} /></Space> },
  ];
  return <>
    <AdminPageHeader title="Sự kiện" description="Tạo, xuất bản và lưu trữ sự kiện bằng dữ liệu PostgreSQL thật." action={canWrite ? <Button type="primary" icon={<Plus size={17} />} onClick={() => edit(null)}>Thêm sự kiện</Button> : undefined} />
    <section className="admin-panel admin-table-panel" aria-label="Danh sách sự kiện"><Table rowKey="id" columns={columns} dataSource={[...events]} loading={pending} scroll={{ x: 900 }} pagination={{ pageSize: 8, showSizeChanger: false }} locale={{ emptyText: "Chưa có sự kiện." }} /></section>
    <Modal width={760} title={editing ? "Sửa sự kiện" : "Tạo sự kiện"} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} confirmLoading={pending} okText="Lưu" cancelText="Hủy" destroyOnHidden>
      <Form form={form} layout="vertical" onFinish={submit} requiredMark="optional">
        <Form.Item name="bannerMediaId" hidden rules={[{ required: true, message: "Hãy chọn banner." }]}><Input /></Form.Item><Form.Item label="Banner"><AdminMediaPicker items={mediaOptions} value={bannerId} label="Banner sự kiện" onChange={(selection) => form.setFieldValue("bannerMediaId", selection?.id ?? "")} /></Form.Item>
        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, whitespace: true }]}><Input maxLength={180} /></Form.Item><Form.Item name="slug" label="Slug"><Input placeholder="Tự sinh nếu để trống" /></Form.Item>
        <Form.Item name="description" label="Mô tả" rules={[{ required: true, whitespace: true }]}><Input.TextArea rows={4} maxLength={5000} /></Form.Item>
        <Space align="start" wrap><Form.Item name="type" label="Loại" rules={[{ required: true }]}><Select style={{ width: 170 }} options={eventTypes.map((value) => ({ value, label: value }))} /></Form.Item><Form.Item name="eventStatus" label="Trạng thái sự kiện"><Select style={{ width: 150 }} options={["upcoming", "live", "ended", "cancelled"].map((value) => ({ value, label: value }))} /></Form.Item><Form.Item name="contentStatus" label="Xuất bản"><Select style={{ width: 150 }} disabled={!canPublish} options={["draft", "scheduled", "published", "archived"].map((value) => ({ value, label: value }))} /></Form.Item></Space>
        <Space align="start" wrap><Form.Item name="startAt" label="Bắt đầu" rules={[{ required: true }]}><Input type="datetime-local" /></Form.Item><Form.Item name="endAt" label="Kết thúc"><Input type="datetime-local" /></Form.Item><Form.Item name="timezone" label="Timezone" rules={[{ required: true }]}><Input /></Form.Item></Space>
        <Space align="start" wrap><Form.Item name="location" label="Địa điểm"><Input /></Form.Item><Form.Item name="platform" label="Nền tảng"><Input /></Form.Item></Space>
        <Form.Item name="externalUrl" label="External URL" rules={[{ type: "url", warningOnly: false }]}><Input type="url" /></Form.Item>
        <Form.Item name="scheduleText" label="Lịch trình" extra="Mỗi dòng: thời gian|nội dung"><Input.TextArea rows={3} /></Form.Item>
        <Form.Item name="featured" label="Nổi bật" valuePropName="checked"><Switch /></Form.Item>
      </Form>
    </Modal>
  </>;
}
