import { Button, Space, Switch, Tag, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { Pencil, Trash2 } from "lucide-react";

import {
  adminStatusColors,
  adminStatusLabels,
  formatAdminDate,
} from "@/components/admin/admin-table.config";
import type { AdminTableRow } from "@/types";

interface AdminTableColumnsOptions {
  label: string;
  showStatus: boolean;
  supportsFeatured: boolean;
  supportsEnabled: boolean;
  onEdit: (row: AdminTableRow) => void;
  onDelete: (row: AdminTableRow) => void;
  onFeaturedChange: (row: AdminTableRow, checked: boolean) => void;
  onEnabledChange: (row: AdminTableRow, checked: boolean) => void;
}

export function createAdminTableColumns({
  label,
  showStatus,
  supportsFeatured,
  supportsEnabled,
  onEdit,
  onDelete,
  onFeaturedChange,
  onEnabledChange,
}: AdminTableColumnsOptions): TableColumnsType<AdminTableRow> {
  const columns: TableColumnsType<AdminTableRow> = [
    {
      title: label === "Mạng xã hội" ? "Kênh" : "Tên nội dung",
      dataIndex: "title",
      key: "title",
      width: 300,
      render: (value: string, row) => (
        <div className="admin-table-title">
          <strong>{value}</strong>
          {row.detail ? <span>{row.detail}</span> : null}
        </div>
      ),
    },
    {
      title: "Phân loại",
      dataIndex: "group",
      key: "group",
      width: 150,
      render: (value?: string) => value ?? "—",
    },
  ];

  if (showStatus) {
    columns.push({
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 145,
      render: (value?: string) =>
        value ? (
          <Tag color={adminStatusColors[value] ?? "default"}>
            {adminStatusLabels[value] ?? value}
          </Tag>
        ) : (
          "—"
        ),
    });
  }

  columns.push({
    title: "Ngày",
    dataIndex: "date",
    key: "date",
    width: 120,
    render: (value?: string) => formatAdminDate(value),
  });

  if (supportsFeatured) {
    columns.push({
      title: "Nổi bật",
      dataIndex: "featured",
      key: "featured",
      width: 100,
      align: "center",
      render: (value: boolean | undefined, row) => (
        <Switch
          size="small"
          checked={Boolean(value)}
          aria-label={`Đặt ${row.title} là nội dung nổi bật`}
          onChange={(checked) => onFeaturedChange(row, checked)}
        />
      ),
    });
  }

  if (supportsEnabled) {
    columns.push({
      title: "Hiển thị",
      dataIndex: "enabled",
      key: "enabled",
      width: 100,
      align: "center",
      render: (value: boolean | undefined, row) => (
        <Switch
          size="small"
          checked={value !== false}
          aria-label={`Bật hoặc tắt ${row.title}`}
          onChange={(checked) => onEnabledChange(row, checked)}
        />
      ),
    });
  }

  columns.push({
    title: "Thao tác",
    key: "actions",
    fixed: "right",
    width: 112,
    render: (_, row) => (
      <Space size="small">
        <Tooltip title="Chỉnh sửa">
          <Button
            type="text"
            icon={<Pencil aria-hidden="true" size={16} />}
            aria-label={`Chỉnh sửa ${row.title}`}
            onClick={() => onEdit(row)}
          />
        </Tooltip>
        <Tooltip title="Xóa">
          <Button
            type="text"
            danger
            icon={<Trash2 aria-hidden="true" size={16} />}
            aria-label={`Xóa ${row.title}`}
            onClick={() => onDelete(row)}
          />
        </Tooltip>
      </Space>
    ),
  });

  return columns;
}
