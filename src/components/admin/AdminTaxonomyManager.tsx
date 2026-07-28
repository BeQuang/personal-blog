"use client";

import { App, Button, Form, Input, Space, Table, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import {
  createCategoryAction,
  createTagAction,
  deleteCategoryAction,
  deleteTagAction,
  updateCategoryAction,
  updateTagAction,
} from "@/actions/taxonomies.actions";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  adminTablePaginationDefaults,
  adminTablePageSizeOptions,
  normalizeAdminTablePageSizeOptions,
} from "@/components/admin/admin-table.config";
import type {
  TaxonomyItem,
  TaxonomyMutationInput,
  TaxonomyPage,
  TaxonomyType,
} from "@/types";

interface AdminTaxonomyManagerProps {
  type: TaxonomyType;
  label: string;
  canWrite: boolean;
  pageSizeOptions?: readonly number[];
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

function isTaxonomyPage(value: unknown): value is TaxonomyPage {
  if (!value || typeof value !== "object") return false;
  const page = value as Partial<TaxonomyPage>;
  return (
    Array.isArray(page.items)
    && typeof page.page === "number"
    && typeof page.pageSize === "number"
    && typeof page.total === "number"
    && typeof page.sortBy === "string"
    && (page.sortOrder === "asc" || page.sortOrder === "desc")
    && page.items.every((item) =>
      Boolean(
        item
        && typeof item === "object"
        && typeof item.id === "string"
        && typeof item.name === "string"
        && typeof item.slug === "string",
      ))
  );
}

function getResponseError(value: unknown) {
  if (!value || typeof value !== "object" || !("error" in value)) {
    return "Không thể tải dữ liệu phân loại.";
  }
  return typeof value.error === "string"
    ? value.error
    : "Không thể tải dữ liệu phân loại.";
}

export function AdminTaxonomyManager({
  type,
  label,
  canWrite,
  pageSizeOptions = adminTablePageSizeOptions,
}: AdminTaxonomyManagerProps) {
  const { message, modal } = App.useApp();
  const router = useRouter();
  const normalizedPageSizeOptions = useMemo(
    () => normalizeAdminTablePageSizeOptions(pageSizeOptions),
    [pageSizeOptions],
  );
  const defaultPageSize = normalizedPageSizeOptions[0];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TaxonomyItem | null>(null);
  const [pageData, setPageData] = useState<TaxonomyPage>({
    items: [],
    page: 1,
    pageSize: defaultPageSize,
    total: 0,
    sortBy: "name",
    sortOrder: "asc",
  });
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();
  const requestSequence = useRef(0);
  const [form] = Form.useForm<FormValues>();

  const loadPage = useCallback(async (page: number, pageSize: number) => {
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        type,
        page: String(page),
        pageSize: String(pageSize),
        sortBy: pageData.sortBy,
        sortOrder: pageData.sortOrder,
      });
      const response = await fetch(`/api/admin/taxonomies?${searchParams}`, {
        cache: "no-store",
        headers: { accept: "application/json" },
      });
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error(getResponseError(payload));
      if (!isTaxonomyPage(payload)) {
        throw new Error("Dữ liệu phân loại trả về không đúng định dạng.");
      }
      if (requestSequence.current === requestId) setPageData(payload);
    } catch (error) {
      void message.error(
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu phân loại.",
      );
    } finally {
      if (requestSequence.current === requestId) setLoading(false);
    }
  }, [message, pageData.sortBy, pageData.sortOrder, type]);

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
      const nextPage = editing ? pageData.page : 1;
      setEditing(null);
      form.resetFields();
      await loadPage(nextPage, pageData.pageSize);
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
        if (!result.success) {
          void message.error(result.message);
          throw new Error(result.message);
        }

        void message.success(result.message);
        const remainingTotal = Math.max(0, pageData.total - 1);
        const lastPage = Math.max(1, Math.ceil(remainingTotal / pageData.pageSize));
        await loadPage(Math.min(pageData.page, lastPage), pageData.pageSize);
        router.refresh();
      },
    });
  };

  const columns: TableColumnsType<TaxonomyItem> = [
    {
      title: "STT",
      key: "index",
      width: 72,
      align: "center",
      render: (_, __, rowIndex) =>
        (pageData.page - 1) * pageData.pageSize + rowIndex + 1,
    },
    {
      title: label,
      key: "name",
      width: 240,
      render: (_, item) => (
        <div className="admin-taxonomy-name">
          <strong>{item.name}</strong>
          {item.description ? <span>{item.description}</span> : null}
        </div>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 116,
      align: "center",
      render: (_, item) => canWrite ? (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              aria-label={`Chỉnh sửa ${item.name}`}
              icon={<Pencil size={16} aria-hidden="true" />}
              onClick={() => setEditing(item)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              aria-label={`Xóa ${item.name}`}
              icon={<Trash2 size={16} aria-hidden="true" />}
              onClick={() => remove(item)}
            />
          </Tooltip>
        </Space>
      ) : null,
    },
  ];

  return (
    <>
      <Button
        disabled={!canWrite}
        onClick={() => {
          setEditing(null);
          setOpen(true);
          void loadPage(1, defaultPageSize);
        }}
      >
        Quản lý {label.toLocaleLowerCase("vi-VN")}
      </Button>

      <AdminModal
        title={`Quản lý ${label.toLocaleLowerCase("vi-VN")}`}
        open={open && editing === null}
        width={820}
        className="admin-taxonomy-modal"
        footer={null}
        onCancel={() => setOpen(false)}
        destroyOnHidden
      >
        <Form<FormValues>
          className="admin-taxonomy-create-form"
          form={form}
          layout="vertical"
          onFinish={save}
          disabled={pending || !canWrite}
        >
          <Space.Compact block>
            <Form.Item
              name="name"
              noStyle
              rules={[{ required: true, message: "Vui lòng nhập tên." }]}
            >
              <Input
                size="large"
                maxLength={100}
                placeholder={`Tên ${label.toLocaleLowerCase("vi-VN")}`}
              />
            </Form.Item>
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              icon={<Plus size={16} aria-hidden="true" />}
              loading={pending}
            >
              Thêm
            </Button>
          </Space.Compact>
        </Form>

        <div className="admin-table-panel admin-taxonomy-table">
          <Table<TaxonomyItem>
            rowKey="id"
            size="middle"
            columns={columns}
            dataSource={[...pageData.items]}
            loading={loading}
            scroll={{ x: 680, y: 440 }}
            pagination={{
              ...adminTablePaginationDefaults,
              current: pageData.page,
              pageSize: pageData.pageSize,
              total: pageData.total,
              pageSizeOptions: normalizedPageSizeOptions.map(String),
              onChange: (page, pageSize) => void loadPage(page, pageSize),
            }}
            locale={{ emptyText: `Chưa có ${label.toLocaleLowerCase("vi-VN")}.` }}
          />
        </div>
      </AdminModal>

      <AdminModal
        title={`Chỉnh sửa ${label.toLocaleLowerCase("vi-VN")}`}
        open={open && editing !== null}
        width={560}
        okText="Lưu thay đổi"
        cancelText="Quay lại"
        confirmLoading={pending}
        onOk={() => form.submit()}
        onCancel={() => setEditing(null)}
        destroyOnHidden
      >
        <Form<FormValues>
          form={form}
          layout="vertical"
          onFinish={save}
          disabled={pending || !canWrite}
        >
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: "Vui lòng nhập tên." }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            extra="Để trống để tự tạo từ tên."
          >
            <Input maxLength={180} />
          </Form.Item>
          {type === "category" ? (
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={3} maxLength={300} showCount />
            </Form.Item>
          ) : null}
        </Form>
      </AdminModal>
    </>
  );
}
