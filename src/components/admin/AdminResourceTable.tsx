"use client";

import {
  App,
  Button,
  Flex,
  Input,
  Select,
  Table,
} from "antd";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminResourceEditorModal } from "@/components/admin/AdminResourceEditorModal";
import { createAdminTableColumns } from "@/components/admin/admin-table-columns";
import {
  adminStatusLabels,
  createAdminDemoRow,
} from "@/components/admin/admin-table.config";
import { adminResourceLabels } from "@/config/admin.config";
import type { AdminResource, AdminTableRow } from "@/types";

interface AdminResourceTableProps {
  resource: AdminResource;
  description: string;
  initialRows: AdminTableRow[];
  supportsFeatured?: boolean;
  supportsEnabled?: boolean;
}

export function AdminResourceTable({
  resource,
  description,
  initialRows,
  supportsFeatured = false,
  supportsEnabled = true,
}: AdminResourceTableProps) {
  const { message, modal } = App.useApp();
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<AdminTableRow | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const label = adminResourceLabels[resource];

  const statusOptions = useMemo(
    () =>
      Array.from(
        new Set(rows.flatMap((row) => (row.status ? [row.status] : []))),
      ).map((value) => ({
        value,
        label: adminStatusLabels[value] ?? value,
      })),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi-VN");
    return rows.filter((row) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [row.title, row.detail, row.group].some((value) =>
          value?.toLocaleLowerCase("vi-VN").includes(normalizedQuery),
        );
      const matchesStatus = status === "all" || row.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, rows, status]);

  const updateRow = (id: string, updates: Partial<AdminTableRow>) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...updates } : row)),
    );
  };

  const openCreate = () => {
    setEditingRow(null);
    setDraftTitle("");
    setTitleError(null);
    setEditorOpen(true);
  };

  const openEdit = (row: AdminTableRow) => {
    setEditingRow(row);
    setDraftTitle(row.title);
    setTitleError(null);
    setEditorOpen(true);
  };

  const saveEditor = () => {
    const title = draftTitle.trim();
    if (!title) {
      setTitleError("Vui lòng nhập tên nội dung.");
      return;
    }

    if (editingRow) {
      updateRow(editingRow.id, { title });
      void message.success(`Đã cập nhật ${label.toLocaleLowerCase("vi-VN")} trong phiên demo.`);
    } else {
      setRows((current) => [createAdminDemoRow(resource, title), ...current]);
      void message.success(`Đã thêm ${label.toLocaleLowerCase("vi-VN")} vào local state.`);
    }
    setEditorOpen(false);
  };

  const confirmDelete = (row: AdminTableRow) => {
    modal.confirm({
      title: `Xóa “${row.title}”?`,
      content: "Thao tác chỉ ảnh hưởng dữ liệu tạm trong phiên này.",
      okText: "Xóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: () => {
        setRows((current) => current.filter((item) => item.id !== row.id));
        void message.success("Đã xóa khỏi local state.");
      },
    });
  };

  const columns = createAdminTableColumns({
    label,
    showStatus: statusOptions.length > 0,
    supportsFeatured,
    supportsEnabled,
    onEdit: openEdit,
    onDelete: confirmDelete,
    onFeaturedChange: (row, checked) => {
      updateRow(row.id, { featured: checked });
      void message.success("Đã cập nhật trạng thái nổi bật.");
    },
    onEnabledChange: (row, checked) => {
      updateRow(row.id, { enabled: checked });
      void message.success(checked ? "Đã bật nội dung." : "Đã tắt nội dung.");
    },
  });

  return (
    <>
      <AdminPageHeader
        title={label}
        description={description}
        action={
          <Button type="primary" icon={<Plus aria-hidden="true" size={17} />} onClick={openCreate}>
            Thêm mới
          </Button>
        }
      />
      <section className="admin-panel admin-table-panel" aria-label={`Danh sách ${label}`}>
        <Flex className="admin-table-toolbar" gap={12} wrap>
          <Input
            allowClear
            prefix={<Search aria-hidden="true" size={17} />}
            placeholder={`Tìm trong ${label.toLocaleLowerCase("vi-VN")}...`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={`Tìm kiếm ${label.toLocaleLowerCase("vi-VN")}`}
          />
          {statusOptions.length > 0 ? (
            <Select
              value={status}
              onChange={setStatus}
              options={[{ value: "all", label: "Tất cả trạng thái" }, ...statusOptions]}
              aria-label="Lọc theo trạng thái"
            />
          ) : null}
        </Flex>
        <Table<AdminTableRow>
          rowKey="id"
          columns={columns}
          dataSource={filteredRows}
          scroll={{ x: 900 }}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          locale={{ emptyText: "Không tìm thấy dữ liệu phù hợp." }}
        />
      </section>

      <AdminResourceEditorModal
        resource={resource}
        label={label}
        open={editorOpen}
        editingRow={editingRow}
        draftTitle={draftTitle}
        titleError={titleError}
        onTitleChange={(value) => {
          setDraftTitle(value);
          if (titleError) setTitleError(null);
        }}
        onSave={saveEditor}
        onCancel={() => {
          setEditorOpen(false);
          setTitleError(null);
        }}
      />
    </>
  );
}
