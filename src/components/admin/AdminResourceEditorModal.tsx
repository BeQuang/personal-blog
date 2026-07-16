"use client";

import { Input, Modal } from "antd";

import type { AdminResource, AdminTableRow } from "@/types";

interface AdminResourceEditorModalProps {
  resource: AdminResource;
  label: string;
  open: boolean;
  editingRow: AdminTableRow | null;
  draftTitle: string;
  titleError: string | null;
  onTitleChange: (value: string) => void;
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
  onTitleChange,
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
      <p className="admin-modal-note">Dữ liệu sẽ mất khi tải lại trang.</p>
    </Modal>
  );
}
