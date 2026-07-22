"use client";

import { App, Button, Form, Input, InputNumber, Modal, Select, Space, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import Image from "next/image";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createGalleryItemAction, deleteGalleryItemAction, updateGalleryItemAction } from "@/actions/gallery.actions";
import { AdminMediaPicker } from "@/components/admin/AdminMediaPicker";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import type { AdminGalleryItem, GalleryMutationInput, MediaOption } from "@/types";

interface Props { items: readonly AdminGalleryItem[]; mediaOptions: readonly MediaOption[]; canWrite: boolean; canPublish: boolean; }
type FormValues = Omit<GalleryMutationInput, "publishedAt"> & { publishedAt?: string };

export function AdminGalleryManager({ items, mediaOptions, canWrite, canPublish }: Props) {
  const { message, modal } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminGalleryItem | null>(null);
  const [pending, startTransition] = useTransition();
  const mediaId = Form.useWatch("mediaAssetId", form);

  const edit = (item: AdminGalleryItem | null) => {
    setEditing(item);
    form.resetFields();
    form.setFieldsValue(item ? { mediaAssetId: item.mediaAssetId, title: item.title, caption: item.caption, category: item.category, alt: item.alt, sortOrder: item.sortOrder, status: item.status, publishedAt: item.publishedAt?.slice(0, 16) } : { sortOrder: 0, status: "draft" });
    setOpen(true);
  };

  const submit = (values: FormValues) => startTransition(async () => {
    const input: GalleryMutationInput = { ...values, caption: values.caption || null, publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : null };
    const result = editing ? await updateGalleryItemAction(editing.id, input) : await createGalleryItemAction(input);
    if (!result.success) { void message.error(result.message); if (result.fieldErrors) form.setFields(Object.entries(result.fieldErrors).map(([name, errors]) => ({ name: name as keyof FormValues, errors: [...errors] }))); return; }
    void message.success(result.message); setOpen(false); form.resetFields(); router.refresh();
  });

  const remove = (item: AdminGalleryItem) => modal.confirm({ title: `Xóa “${item.title}”?`, content: "Chỉ item Gallery bị xóa mềm; file gốc trong Media Library không bị xóa.", okText: "Xóa", okButtonProps: { danger: true }, cancelText: "Hủy", onOk: async () => { const result = await deleteGalleryItemAction(item.id); if (!result.success) throw new Error(result.message); void message.success(result.message); router.refresh(); } });
  const columns: TableColumnsType<AdminGalleryItem> = [
    { title: "Ảnh", width: 90, render: (_, item) => <div className="admin-media-thumb">{item.imageUrl ? <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" /> : <span>Chưa có ảnh</span>}</div> },
    { title: "Nội dung", render: (_, item) => <div className="admin-table-title"><strong>{item.title}</strong><span>{item.category} · thứ tự {item.sortOrder}</span></div> },
    { title: "Trạng thái", width: 140, render: (_, item) => <Tag color={item.status === "published" ? "success" : item.status === "scheduled" ? "gold" : "default"}>{item.status}</Tag> },
    { title: "Thao tác", width: 120, render: (_, item) => <Space><Button type="text" aria-label={`Sửa ${item.title}`} disabled={!canWrite || (item.status !== "draft" && !canPublish)} icon={<Pencil size={16} />} onClick={() => edit(item)} /><Button type="text" danger aria-label={`Xóa ${item.title}`} disabled={!canWrite || ((item.status === "published" || item.status === "scheduled") && !canPublish)} icon={<Trash2 size={16} />} onClick={() => remove(item)} /></Space> },
  ];

  return <>
    <AdminPageHeader title="Hình ảnh" description="Quản lý Gallery public bằng PostgreSQL; file ảnh gốc tiếp tục được quản lý riêng trong Media Library." action={canWrite ? <Button type="primary" icon={<Plus size={17} />} onClick={() => edit(null)}>Thêm ảnh</Button> : undefined} />
    <section className="admin-panel admin-table-panel" aria-label="Danh sách Gallery"><Table rowKey="id" columns={columns} dataSource={[...items]} loading={pending} scroll={{ x: 760 }} pagination={{ pageSize: 12, showSizeChanger: false }} locale={{ emptyText: "Gallery chưa có item." }} /></section>
    <Modal title={editing ? "Sửa Gallery item" : "Thêm Gallery item"} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} confirmLoading={pending} okText="Lưu" cancelText="Hủy" destroyOnHidden>
      <Form form={form} layout="vertical" onFinish={submit} requiredMark="optional">
        <Form.Item name="mediaAssetId" label="Ảnh" rules={[{ required: true, message: "Hãy chọn ảnh." }]}><Input hidden /></Form.Item>
        <AdminMediaPicker items={mediaOptions} value={mediaId} label="Ảnh Gallery" onChange={(selection) => form.setFieldValue("mediaAssetId", selection?.id)} />
        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, whitespace: true }]}><Input maxLength={180} /></Form.Item>
        <Form.Item name="alt" label="Alt text" rules={[{ required: true, whitespace: true }]}><Input maxLength={300} /></Form.Item>
        <Form.Item name="caption" label="Caption"><Input.TextArea rows={3} maxLength={500} /></Form.Item>
        <Space align="start" wrap><Form.Item name="category" label="Danh mục" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item><Form.Item name="sortOrder" label="Thứ tự" rules={[{ required: true }]}><InputNumber min={0} /></Form.Item></Space>
        <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}><Select options={["draft", "scheduled", "published", "archived"].map((value) => ({ value, label: value }))} disabled={!canPublish} /></Form.Item>
        <Form.Item noStyle shouldUpdate={(prev, next) => prev.status !== next.status}>{({ getFieldValue }) => getFieldValue("status") === "scheduled" || getFieldValue("status") === "published" ? <Form.Item name="publishedAt" label="Thời điểm xuất bản" rules={[{ required: getFieldValue("status") === "scheduled" }]} extra={getFieldValue("status") === "published" ? "Để trống để xuất bản ngay." : undefined}><Input type="datetime-local" /></Form.Item> : null}</Form.Item>
      </Form>
    </Modal>
  </>;
}
