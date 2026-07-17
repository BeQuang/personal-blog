"use client";

import { App, Button, Form, Input, List, Modal, Space, Tooltip } from "antd";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createCategoryAction,
  createTagAction,
  deleteCategoryAction,
  deleteTagAction,
  updateCategoryAction,
  updateTagAction,
} from "@/actions/taxonomies.actions";
import type { TaxonomyItem, TaxonomyMutationInput } from "@/types";

interface AdminTaxonomyManagerProps {
  type: "category" | "tag";
  label: string;
  items: readonly TaxonomyItem[];
  canWrite: boolean;
}

interface FormValues {
  name: string;
  slug?: string;
  description?: string;
}

const taxonomyFieldNames: Readonly<Record<string, keyof FormValues>> = {
  name: "name",
  slug: "slug",
  description: "description",
};

export function AdminTaxonomyManager({
  type,
  label,
  items,
  canWrite,
}: AdminTaxonomyManagerProps) {
  const { message, modal } = App.useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TaxonomyItem | null>(null);
  const [pending, startTransition] = useTransition();
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      name: editing?.name ?? "",
      slug: editing?.slug ?? "",
      description: editing?.description ?? "",
    });
  }, [editing, form, open]);

  const save = (values: FormValues) => {
    const input: TaxonomyMutationInput = {
      name: values.name,
      slug: values.slug,
      description: values.description || null,
    };
    startTransition(async () => {
      const result = editing
        ? type === "category"
          ? await updateCategoryAction(editing.id, input)
          : await updateTagAction(editing.id, input)
        : type === "category"
          ? await createCategoryAction(input)
          : await createTagAction(input);

      if (!result.success) {
        if (result.fieldErrors) {
          form.setFields(Object.entries(result.fieldErrors).flatMap(([name, errors]) => {
            const fieldName = taxonomyFieldNames[name];
            return fieldName ? [{ name: fieldName, errors: [...errors] }] : [];
          }));
        }
        void message.error(result.message);
        return;
      }

      void message.success(result.message);
      setOpen(false);
      router.refresh();
    });
  };

  const remove = (item: TaxonomyItem) => {
    modal.confirm({
      title: `Xóa “${item.name}”?`,
      content: type === "category"
        ? "Danh mục đang được bài viết sử dụng sẽ không thể xóa."
        : "Thẻ sẽ được gỡ khỏi các bài viết liên quan.",
      okText: "Xóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: async () => {
        const result = type === "category"
          ? await deleteCategoryAction(item.id)
          : await deleteTagAction(item.id);
        if (result.success) {
          void message.success(result.message);
          router.refresh();
          return;
        }
        void message.error(result.message);
        throw new Error(result.message);
      },
    });
  };

  return (
    <>
      <Button
        disabled={!canWrite}
        onClick={() => {
          setEditing(null);
          setOpen(true);
        }}
      >
        Quản lý {label.toLocaleLowerCase("vi-VN")}
      </Button>
      <Modal
        title={`Quản lý ${label.toLocaleLowerCase("vi-VN")}`}
        open={open && editing === null}
        footer={null}
        onCancel={() => setOpen(false)}
        destroyOnHidden
      >
        <Form<FormValues> form={form} layout="vertical" onFinish={save} disabled={pending || !canWrite}>
          <Space.Compact block>
            <Form.Item name="name" noStyle rules={[{ required: true, message: "Vui lòng nhập tên." }]}>
              <Input placeholder={`Tên ${label.toLocaleLowerCase("vi-VN")}`} />
            </Form.Item>
            <Button type="primary" htmlType="submit" icon={<Plus size={16} aria-hidden="true" />} loading={pending}>
              Thêm
            </Button>
          </Space.Compact>
        </Form>
        <List
          className="admin-taxonomy-list"
          dataSource={[...items]}
          locale={{ emptyText: `Chưa có ${label.toLocaleLowerCase("vi-VN")}.` }}
          renderItem={(item) => (
            <List.Item
              actions={canWrite ? [
                <Tooltip title="Chỉnh sửa" key="edit">
                  <Button
                    type="text"
                    aria-label={`Chỉnh sửa ${item.name}`}
                    icon={<Pencil size={15} aria-hidden="true" />}
                    onClick={() => {
                      setEditing(item);
                      setOpen(true);
                    }}
                  />
                </Tooltip>,
                <Tooltip title="Xóa" key="delete">
                  <Button
                    type="text"
                    danger
                    aria-label={`Xóa ${item.name}`}
                    icon={<Trash2 size={15} aria-hidden="true" />}
                    onClick={() => remove(item)}
                  />
                </Tooltip>,
              ] : undefined}
            >
              <List.Item.Meta title={item.name} description={item.slug} />
            </List.Item>
          )}
        />
      </Modal>

      <Modal
        title={`Chỉnh sửa ${label.toLocaleLowerCase("vi-VN")}`}
        open={open && editing !== null}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        confirmLoading={pending}
        onOk={() => form.submit()}
        onCancel={() => {
          setEditing(null);
          setOpen(false);
        }}
        destroyOnHidden
      >
        <Form<FormValues> form={form} layout="vertical" onFinish={save} disabled={pending || !canWrite}>
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: "Vui lòng nhập tên." }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="slug" label="Slug" extra="Để trống để tự tạo từ tên.">
            <Input maxLength={180} />
          </Form.Item>
          {type === "category" ? (
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={3} maxLength={300} showCount />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </>
  );
}
