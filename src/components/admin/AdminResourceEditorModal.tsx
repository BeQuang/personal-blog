"use client";

import { Input, Modal } from "antd";

import { AdminMediaPicker } from "@/components/admin/AdminMediaPicker";
import type { AdminResource, AdminTableRow, MediaOption } from "@/types";

interface AdminResourceEditorModalProps {
  resource: AdminResource;
  label: string;
  open: boolean;
  editingRow: AdminTableRow | null;
  draftTitle: string;
  titleError: string | null;
  mediaOptions?: readonly MediaOption[];
  selectedMediaId?: string;
  onTitleChange: (value: string) => void;
  onMediaChange?: (value: { id: string; publicUrl: string } | null) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function AdminResourceEditorModal({
  resource,
  label,
  open,
  editingRow,
  draftTitle,
  titleError,
  mediaOptions = [],
  selectedMediaId,
  onTitleChange,
  onMediaChange,
  onSave,
  onCancel,
}: AdminResourceEditorModalProps) {
  const inputId = `${resource}-title`;
  const errorId = `${inputId}-error`;

  return (
    <Modal
      title={
        editingRow
          ? `Chỉnh sửa ${label.toLocaleLowerCase("vi-VN")}`
          : `Thêm ${label.toLocaleLowerCase("vi-VN")}`
      }
      open={open}
      onOk={onSave}
      onCancel={onCancel}
      okText={editingRow ? "Lưu thay đổi" : "Thêm vào demo"}
      cancelText="Hủy"
      destroyOnHidden
    >
      <label className="admin-modal-label" htmlFor={inputId}>
        Tên nội dung <span aria-hidden="true">*</span>
      </label>
      <Input
        id={inputId}
        value={draftTitle}
        onChange={(event) => onTitleChange(event.target.value)}
        onPressEnter={onSave}
        placeholder="Nhập tên nội dung"
        maxLength={160}
        showCount
        status={titleError ? "error" : undefined}
        aria-required="true"
        aria-invalid={Boolean(titleError)}
        aria-describedby={titleError ? errorId : undefined}
      />
      {titleError ? (
        <p id={errorId} className="admin-modal-error" role="alert">
          {titleError}
        </p>
      ) : null}
      {(resource === "events" || resource === "campaigns") && onMediaChange ? (
        <div className="admin-modal-media-field">
          <span>Banner</span>
          <AdminMediaPicker
            items={mediaOptions}
            value={selectedMediaId}
            label={resource === "events" ? "Event banner" : "Campaign banner"}
            onChange={onMediaChange}
          />
        </div>
      ) : null}
      <p className="admin-modal-note">Dữ liệu sẽ mất khi tải lại trang.</p>
    </Modal>
  );
}
