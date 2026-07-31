"use client";

import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import type { TableColumnsType } from "antd";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import {
  createGalleryItemAction,
  deleteGalleryItemAction,
  updateGalleryItemAction,
} from "@/actions/gallery.actions";
import { adminTablePaginationDefaults } from "@/components/admin/admin-table.config";
import { AdminDateTimePicker } from "@/components/admin/AdminDatePickers";
import {
  AdminMediaPicker,
  type AdminMediaPickerSelection,
} from "@/components/admin/AdminMediaPicker";
import { AdminModal } from "@/components/admin/AdminModal";
import { useAdminListPage } from "@/components/admin/useAdminListPage";
import type {
  AdminGalleryItem,
  AdminGalleryListQuery,
  AdminListPage,
  GalleryMutationInput,
  MediaOption,
} from "@/types";

interface Props {
  initialPage: AdminListPage<
    AdminGalleryItem,
    AdminGalleryListQuery["sortBy"]
  >;
  categories: readonly string[];
  mediaOptions: readonly MediaOption[];
  canWrite: boolean;
  canPublish: boolean;
}

type FormValues = Omit<GalleryMutationInput, "publishedAt"> & {
  publishedAt?: string;
};

interface GalleryCreateDraft extends AdminMediaPickerSelection {
  title: string;
  alt: string;
  sortOffset: number;
}

function createImageDescription(label: string) {
  const withoutExtension = label.replace(/\.[a-z0-9]+$/i, "");
  const normalized = withoutExtension.replace(/[-_]+/g, " ").trim();
  return normalized.length >= 3 ? normalized : `Ảnh ${label}`.slice(0, 300);
}

export function AdminGalleryManager({
  initialPage,
  categories,
  mediaOptions,
  canWrite,
  canPublish,
}: Props) {
  const { message, modal } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminGalleryItem | null>(null);
  const [createDrafts, setCreateDrafts] = useState<GalleryCreateDraft[]>([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ query: "", category: "all" });
  const [pending, startTransition] = useTransition();
  const mediaId = Form.useWatch("mediaAssetId", form);
  const reportListError = useCallback((error: string) => {
    void message.error(error);
  }, [message]);
  const { data, load, loading, reload } = useAdminListPage(
    "/api/admin/gallery",
    initialPage,
    reportListError,
  );
  const applyFilters = (changes: Partial<typeof filters>) => {
    const nextFilters = { ...filters, ...changes };
    setFilters(nextFilters);
    return load({
      page: 1,
      pageSize: data.pageSize,
      sortBy: data.sortBy,
      sortOrder: data.sortOrder,
      ...nextFilters,
    });
  };

  const edit = (item: AdminGalleryItem | null) => {
    setEditing(item);
    setCreateDrafts([]);
    form.resetFields();
    form.setFieldsValue(item
      ? {
          mediaAssetId: item.mediaAssetId,
          title: item.title,
          caption: item.caption,
          category: item.category,
          alt: item.alt,
          sortOrder: item.sortOrder,
          status: item.status,
          publishedAt: item.publishedAt?.slice(0, 16),
        }
      : { sortOrder: 0, status: "draft" });
    setOpen(true);
  };

  const submit = (values: FormValues) => startTransition(async () => {
    const commonInput = {
      ...values,
      caption: values.caption || null,
      publishedAt: values.publishedAt
        ? new Date(values.publishedAt).toISOString()
        : null,
    };

    if (editing) {
      const result = await updateGalleryItemAction(
        editing.id,
        commonInput as GalleryMutationInput,
      );
      if (!result.success) {
        void message.error(result.message);
        if (result.fieldErrors) {
          form.setFields(
            Object.entries(result.fieldErrors).map(([name, errors]) => ({
              name: name as keyof FormValues,
              errors: [...errors],
            })),
          );
        }
        return;
      }

      void message.success(result.message);
      setOpen(false);
      form.resetFields();
      await reload();
      router.refresh();
      return;
    }

    if (createDrafts.length === 0) {
      void message.error("Hãy chọn ít nhất một ảnh cho Gallery.");
      return;
    }

    const invalidDraftIndex = createDrafts.findIndex(
      (draft) => draft.title.trim().length < 2 || draft.alt.trim().length < 3,
    );
    if (invalidDraftIndex >= 0) {
      void message.error(
        `Ảnh ${invalidDraftIndex + 1} cần tiêu đề tối thiểu 2 ký tự ` +
        "và alt text tối thiểu 3 ký tự.",
      );
      return;
    }

    const createdIds = new Set<string>();
    const errors: string[] = [];
    for (const draft of createDrafts) {
      const result = await createGalleryItemAction({
        ...commonInput,
        mediaAssetId: draft.id,
        title: draft.title,
        alt: draft.alt,
        sortOrder: values.sortOrder + draft.sortOffset,
      } as GalleryMutationInput);
      if (result.success) {
        createdIds.add(draft.id);
      } else {
        errors.push(`${draft.label}: ${result.message}`);
      }
    }

    if (createdIds.size > 0) {
      setCreateDrafts((current) =>
        current.filter((draft) => !createdIds.has(draft.id)));
      await reload();
      router.refresh();
    }

    if (errors.length > 0) {
      void message.warning(
        `Đã tạo ${createdIds.size}/${createDrafts.length} Gallery item. ` +
        `Các ảnh lỗi được giữ lại. ${errors[0]}`,
      );
      return;
    }

    void message.success(`Đã tạo ${createdIds.size} Gallery item.`);
    setOpen(false);
    form.resetFields();
  });

  const remove = (item: AdminGalleryItem) => modal.confirm({
    title: `Xóa “${item.title}”?`,
    content:
      "Chỉ item Gallery bị xóa mềm; file gốc trong Media Library không bị xóa.",
    okText: "Xóa",
    okButtonProps: { danger: true },
    cancelText: "Hủy",
    onOk: async () => {
      const result = await deleteGalleryItemAction(item.id);
      if (!result.success) throw new Error(result.message);
      void message.success(result.message);
      await reload();
      router.refresh();
    },
  });

  const columns: TableColumnsType<AdminGalleryItem> = [
    {
      title: "Ảnh",
      width: 90,
      render: (_, item) => (
        <div className="admin-media-thumb">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : <span>Chưa có ảnh</span>}
        </div>
      ),
    },
    {
      title: "Nội dung",
      render: (_, item) => (
        <div className="admin-table-title">
          <strong>{item.title}</strong>
          <span>Thứ tự {item.sortOrder}</span>
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      width: 180,
      render: (category: string) => <Tag color="purple">{category}</Tag>,
    },
    {
      title: "Trạng thái",
      width: 140,
      render: (_, item) => (
        <Tag
          color={item.status === "published"
            ? "success"
            : item.status === "scheduled"
              ? "gold"
              : "default"}
        >
          {item.status}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      width: 120,
      render: (_, item) => (
        <Space>
          <Button
            type="text"
            aria-label={`Sửa ${item.title}`}
            disabled={!canWrite || (item.status !== "draft" && !canPublish)}
            icon={<Pencil size={16} />}
            onClick={() => edit(item)}
          />
          <Button
            type="text"
            danger
            aria-label={`Xóa ${item.title}`}
            disabled={!canWrite
              || ((item.status === "published"
                || item.status === "scheduled") && !canPublish)}
            icon={<Trash2 size={16} />}
            onClick={() => remove(item)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-gallery-tab-content">
      <header className="admin-gallery-tab-header">
        <div>
          <h2>Ảnh trên website</h2>
          <p>Tạo và sắp xếp các hình ảnh được hiển thị trong Gallery công khai.</p>
        </div>
        {canWrite ? (
          <Button
            type="primary"
            icon={<Plus size={17} />}
            onClick={() => edit(null)}
          >
            Thêm ảnh
          </Button>
        ) : null}
      </header>

      <section
        className="admin-panel admin-gallery-filter-panel"
        aria-label="Bộ lọc Gallery"
      >
        <div className="admin-gallery-filter-controls">
          <Input
            allowClear
            value={query}
            prefix={<Search size={17} aria-hidden="true" />}
            placeholder="Tìm tiêu đề, mô tả, alt hoặc danh mục..."
            onChange={(event) => setQuery(event.target.value)}
            onPressEnter={() => void applyFilters({ query })}
            aria-label="Tìm trong Gallery"
          />
          <Button
            loading={loading}
            onClick={() => void applyFilters({ query })}
          >
            Tìm
          </Button>
          <Select
            value={filters.category}
            aria-label="Lọc danh mục Gallery"
            onChange={(category) => void applyFilters({ category })}
            options={[
              { value: "all", label: "Mọi danh mục" },
              ...categories.map((category) => ({
                value: category,
                label: category,
              })),
            ]}
          />
        </div>
      </section>

      <section
        className="admin-panel admin-table-panel admin-viewport-table-panel admin-gallery-table-panel"
        aria-label="Danh sách Gallery"
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={[...data.items]}
          loading={pending || loading}
          scroll={{ x: 940, y: "70vh" }}
          pagination={{
            ...adminTablePaginationDefaults,
            current: data.page,
            pageSize: data.pageSize,
            total: data.total,
          }}
          onChange={(pagination) => void load({
            page: pagination.current ?? 1,
            pageSize: pagination.pageSize ?? data.pageSize,
            sortBy: data.sortBy,
            sortOrder: data.sortOrder,
            ...filters,
          })}
          locale={{ emptyText: "Không có ảnh phù hợp với bộ lọc." }}
        />
      </section>

      <AdminModal
        title={editing ? "Sửa Gallery item" : "Thêm Gallery item"}
        open={open}
        width={1040}
        className="admin-gallery-editor-modal"
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={pending}
        okText={editing
          ? "Lưu"
          : `Tạo ${Math.max(createDrafts.length, 1)} item`}
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form
          form={form}
          className="admin-gallery-editor-form"
          layout="vertical"
          onFinish={submit}
          requiredMark="optional"
        >
          <div className="admin-gallery-editor-media">
            {editing ? (
              <>
                <Form.Item
                  name="mediaAssetId"
                  hidden
                  rules={[{ required: true, message: "Hãy chọn ảnh." }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item label="Ảnh" required>
                  <AdminMediaPicker
                    items={mediaOptions}
                    value={mediaId}
                    label="Ảnh Gallery"
                    purpose="gallery"
                    onChange={(selection) =>
                      form.setFieldValue("mediaAssetId", selection?.id)}
                  />
                </Form.Item>
              </>
            ) : (
              <Form.Item
                label="Ảnh"
                required
                extra="Chọn hoặc tải nhiều ảnh; mỗi ảnh sẽ tạo thành một Gallery item."
              >
                <AdminMediaPicker
                  items={mediaOptions}
                  selectionMode="multiple"
                  value={createDrafts.map((draft) => draft.id)}
                  label="Ảnh Gallery"
                  purpose="gallery"
                  showSelectionPreview={false}
                  onChange={(selections) =>
                    setCreateDrafts((current) => {
                      const currentById = new Map(
                        current.map((draft) => [draft.id, draft]),
                      );
                      return selections.map((selection, index) => {
                        const existing = currentById.get(selection.id);
                        if (existing) {
                          return { ...existing, sortOffset: index };
                        }
                        const description = createImageDescription(
                          selection.label,
                        );
                        return {
                          ...selection,
                          title: description.slice(0, 180),
                          alt: description.slice(0, 300),
                          sortOffset: index,
                        };
                      });
                    })}
                />
              </Form.Item>
            )}
          </div>

          {!editing && createDrafts.length > 0 ? (
            <div className="admin-gallery-create-grid">
              {createDrafts.map((draft, index) => (
                <article className="admin-gallery-create-card" key={draft.id}>
                  <div className="admin-gallery-create-preview">
                    <Image
                      src={draft.publicUrl}
                      alt=""
                      fill
                      sizes="180px"
                      className="object-cover"
                    />
                  </div>
                  <div className="admin-gallery-create-fields">
                    <div className="admin-gallery-create-card-heading">
                      <strong>Ảnh {index + 1}</strong>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<Trash2 size={15} aria-hidden="true" />}
                        aria-label={`Bỏ ${draft.label}`}
                        onClick={() =>
                          setCreateDrafts((current) =>
                            current.filter((item) => item.id !== draft.id))}
                      />
                    </div>
                    <Input
                      value={draft.title}
                      maxLength={180}
                      placeholder="Tiêu đề hiển thị, ví dụ: Hậu trường ghi hình"
                      aria-label={`Tiêu đề cho ảnh ${index + 1}`}
                      onChange={(event) =>
                        setCreateDrafts((current) =>
                          current.map((item) =>
                            item.id === draft.id
                              ? { ...item, title: event.target.value }
                              : item))}
                    />
                    <Input
                      value={draft.alt}
                      maxLength={300}
                      placeholder="Mô tả nội dung ảnh cho SEO và trợ năng"
                      aria-label={`Alt text cho ảnh ${index + 1}`}
                      onChange={(event) =>
                        setCreateDrafts((current) =>
                          current.map((item) =>
                            item.id === draft.id
                              ? { ...item, alt: event.target.value }
                              : item))}
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {editing ? (
            <div className="admin-gallery-editor-field-grid">
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, whitespace: true }]}
              >
                <Input
                  maxLength={180}
                  placeholder="Ví dụ: Hậu trường buổi ghi hình"
                />
              </Form.Item>
              <Form.Item
                name="alt"
                label="Alt text"
                rules={[{ required: true, whitespace: true }]}
              >
                <Input
                  maxLength={300}
                  placeholder="Mô tả ngắn nội dung ảnh cho SEO và trợ năng"
                />
              </Form.Item>
            </div>
          ) : null}

          <div className="admin-gallery-editor-field-grid is-common">
            <Form.Item
              name="caption"
              label="Caption"
              className="is-full"
            >
              <Input.TextArea
                rows={3}
                maxLength={500}
                placeholder="Nhập chú thích hiển thị cùng ảnh (tùy chọn)"
              />
            </Form.Item>
            <Form.Item
              name="category"
              label="Danh mục"
              rules={[{ required: true, whitespace: true }]}
            >
              <Input placeholder="Ví dụ: Hậu trường, Sự kiện, Du lịch" />
            </Form.Item>
            <Form.Item
              name="sortOrder"
              label="Thứ tự"
              rules={[{ required: true }]}
            >
              <InputNumber
                min={0}
                placeholder="0"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Chọn trạng thái hiển thị"
                options={["draft", "scheduled", "published", "archived"].map(
                  (value) => ({ value, label: value }),
                )}
                disabled={!canPublish}
              />
            </Form.Item>
          </div>
          <Form.Item
            noStyle
            shouldUpdate={(prev, next) => prev.status !== next.status}
          >
            {({ getFieldValue }) =>
              getFieldValue("status") === "scheduled"
              || getFieldValue("status") === "published"
                ? (
                    <Form.Item
                      name="publishedAt"
                      label="Thời điểm xuất bản"
                      rules={[{
                        required: getFieldValue("status") === "scheduled",
                      }]}
                      extra={getFieldValue("status") === "published"
                        ? "Để trống để xuất bản ngay."
                        : undefined}
                    >
                      <AdminDateTimePicker />
                    </Form.Item>
                  )
                : null}
          </Form.Item>
        </Form>
      </AdminModal>
    </div>
  );
}
