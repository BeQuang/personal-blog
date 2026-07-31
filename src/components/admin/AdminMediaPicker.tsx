"use client";

import { App, Button, Empty, Input, Spin, Tabs } from "antd";
import { Images, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { AdminModal } from "@/components/admin/AdminModal";
import {
  acceptedMediaImageTypes,
  maximumAvatarImageSizeBytes,
  maximumMediaImageSizeBytes,
  uploadMediaImage,
  validateMediaImageFile,
} from "@/lib/media-image-upload";
import type { MediaPurpose } from "@/types";

export interface AdminMediaPickerOption {
  id: string;
  label: string;
  publicUrl: string;
}

export type AdminMediaPickerSelection = AdminMediaPickerOption;

interface AdminMediaPickerBaseProps {
  items: readonly AdminMediaPickerOption[];
  label: string;
  purpose: MediaPurpose;
  showSelectionPreview?: boolean;
}

interface AdminMediaPickerSingleProps extends AdminMediaPickerBaseProps {
  selectionMode?: "single";
  value?: string;
  onChange: (value: AdminMediaPickerSelection | null) => void;
}

interface AdminMediaPickerMultipleProps extends AdminMediaPickerBaseProps {
  selectionMode: "multiple";
  value?: readonly string[];
  onChange: (value: AdminMediaPickerSelection[]) => void;
}

type AdminMediaPickerProps =
  | AdminMediaPickerSingleProps
  | AdminMediaPickerMultipleProps;

type PickerDraftStatus = "ready" | "uploading" | "failed";

interface PickerDraftUpload {
  id: string;
  file: File;
  previewUrl: string;
  alt: string;
  status: PickerDraftStatus;
  error?: string;
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIdentity(file: File) {
  return [file.name, file.size, file.type, file.lastModified].join(":");
}

export function AdminMediaPicker(props: AdminMediaPickerProps) {
  const { items, label, purpose } = props;
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("library");
  const [query, setQuery] = useState("");
  const [uploadedItems, setUploadedItems] = useState<AdminMediaPickerOption[]>([]);
  const [draftSelectedIds, setDraftSelectedIds] = useState<string[]>([]);
  const [draftUploads, setDraftUploads] = useState<PickerDraftUpload[]>([]);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftUploadsRef = useRef<PickerDraftUpload[]>([]);
  const isMultiple = props.selectionMode === "multiple";
  const selectedIds = useMemo(
    () => new Set(
      isMultiple
        ? [...(props.value ?? [])]
        : props.value
          ? [props.value]
          : [],
    ),
    [isMultiple, props.value],
  );
  const availableItems = useMemo(() => {
    const uniqueItems = new Map<string, AdminMediaPickerOption>();
    for (const item of uploadedItems) uniqueItems.set(item.id, item);
    for (const item of items) uniqueItems.set(item.id, item);
    return [...uniqueItems.values()];
  }, [items, uploadedItems]);
  const availableItemsById = useMemo(
    () => new Map(availableItems.map((item) => [item.id, item])),
    [availableItems],
  );
  const selectedItems = [...selectedIds].flatMap((id) => {
    const item = availableItemsById.get(id);
    return item ? [item] : [];
  });
  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi-VN");
    return normalized
      ? availableItems.filter((item) =>
          item.label.toLocaleLowerCase("vi-VN").includes(normalized))
      : availableItems;
  }, [availableItems, query]);
  const maximumSize = purpose === "avatar"
    ? maximumAvatarImageSizeBytes
    : maximumMediaImageSizeBytes;

  const replaceDraftUploads = (uploads: PickerDraftUpload[]) => {
    draftUploadsRef.current = uploads;
    setDraftUploads(uploads);
  };

  useEffect(() => () => {
    for (const upload of draftUploadsRef.current) {
      URL.revokeObjectURL(upload.previewUrl);
    }
  }, []);

  const clearDraftUploads = () => {
    for (const upload of draftUploadsRef.current) {
      URL.revokeObjectURL(upload.previewUrl);
    }
    replaceDraftUploads([]);
  };

  const removeDraftUpload = (id: string) => {
    const removed = draftUploadsRef.current.find((upload) => upload.id === id);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    replaceDraftUploads(
      draftUploadsRef.current.filter((upload) => upload.id !== id),
    );
  };

  const updateDraftUpload = (
    id: string,
    changes: Partial<Pick<PickerDraftUpload, "alt" | "status" | "error">>,
  ) => {
    replaceDraftUploads(
      draftUploadsRef.current.map((upload) =>
        upload.id === id ? { ...upload, ...changes } : upload),
    );
  };

  const emitSelection = (selection: AdminMediaPickerSelection[]) => {
    if (props.selectionMode === "multiple") {
      props.onChange(selection);
      return;
    }
    props.onChange(selection[0] ?? null);
  };

  const closePicker = () => {
    if (pending) return;
    clearDraftUploads();
    setOpen(false);
  };

  const showPicker = (tab: "library" | "upload") => {
    setDraftSelectedIds([...selectedIds]);
    setActiveTab(tab);
    setOpen(true);
  };

  const toggleLibraryItem = (item: AdminMediaPickerOption) => {
    if (!isMultiple) {
      emitSelection([item]);
      clearDraftUploads();
      setOpen(false);
      return;
    }

    setDraftSelectedIds((current) =>
      current.includes(item.id)
        ? current.filter((id) => id !== item.id)
        : [...current, item.id]);
  };

  const confirmMultipleSelection = () => {
    emitSelection(draftSelectedIds.flatMap((id) => {
      const item = availableItemsById.get(id);
      return item ? [item] : [];
    }));
    clearDraftUploads();
    setOpen(false);
  };

  const selectLocalFiles = (files: readonly File[]) => {
    const queue = isMultiple ? files : files.slice(0, 1);
    if (queue.length === 0) return;

    const currentUploads = isMultiple ? [...draftUploadsRef.current] : [];
    const identities = new Set(
      currentUploads.map((upload) => getFileIdentity(upload.file)),
    );
    const validUploads: PickerDraftUpload[] = [];
    const errors: string[] = [];

    for (const file of queue) {
      try {
        validateMediaImageFile(file, purpose);
        const identity = getFileIdentity(file);
        if (identities.has(identity)) continue;
        identities.add(identity);
        validUploads.push({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          alt: "",
          status: "ready",
        });
      } catch (error) {
        errors.push(
          `${file.name}: ${
            error instanceof Error ? error.message : "File ảnh không hợp lệ."
          }`,
        );
      }
    }

    if (!isMultiple && validUploads.length > 0) {
      clearDraftUploads();
      replaceDraftUploads(validUploads);
    } else if (validUploads.length > 0) {
      replaceDraftUploads([...currentUploads, ...validUploads]);
    }

    if (errors.length > 0) {
      void message.warning(
        `Đã thêm ${validUploads.length}/${queue.length} ảnh vào preview. ${errors[0]}`,
      );
    }
  };

  const confirmDraftUploads = () => {
    const queue = [...draftUploadsRef.current];
    if (queue.length === 0) return;

    startTransition(async () => {
      const uploaded: AdminMediaPickerOption[] = [];
      const errors: string[] = [];
      const successfulIds = new Set<string>();

      for (const draft of queue) {
        updateDraftUpload(draft.id, {
          status: "uploading",
          error: undefined,
        });
        try {
          const asset = await uploadMediaImage({
            file: draft.file,
            purpose,
            alt: draft.alt,
          });
          uploaded.push({
            id: asset.id,
            label: asset.originalFilename,
            publicUrl: asset.publicUrl,
          });
          successfulIds.add(draft.id);
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : "Tải ảnh thất bại.";
          errors.push(`${draft.file.name}: ${errorMessage}`);
          updateDraftUpload(draft.id, {
            status: "failed",
            error: errorMessage,
          });
        }
      }

      const remainingUploads = draftUploadsRef.current.filter(
        (draft) => !successfulIds.has(draft.id),
      );
      for (const draft of draftUploadsRef.current) {
        if (successfulIds.has(draft.id)) {
          URL.revokeObjectURL(draft.previewUrl);
        }
      }
      replaceDraftUploads(remainingUploads);

      if (uploaded.length > 0) {
        setUploadedItems((current) => {
          const merged = new Map(current.map((item) => [item.id, item]));
          for (const item of uploaded) merged.set(item.id, item);
          return [...uploaded, ...[...merged.values()].filter(
            (item) => !uploaded.some((next) => next.id === item.id),
          )];
        });

        if (isMultiple) {
          setDraftSelectedIds((current) => [
            ...new Set([...current, ...uploaded.map((item) => item.id)]),
          ]);
          if (remainingUploads.length === 0) setActiveTab("library");
        } else {
          emitSelection([uploaded[0]]);
          clearDraftUploads();
          setOpen(false);
        }
      }

      if (errors.length > 0) {
        void message.warning(
          `Đã tải thành công ${uploaded.length}/${queue.length} ảnh. ${errors[0]}`,
        );
      } else {
        void message.success(
          isMultiple
            ? `Đã tải ${uploaded.length} ảnh và thêm vào vùng chọn.`
            : "Đã tải ảnh lên Media Library và chọn vào form.",
        );
      }
    });
  };

  const libraryContent = (
    <>
      <Input.Search
        allowClear
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tìm theo tên file hoặc alt text..."
        aria-label="Tìm ảnh trong Media Library"
      />
      {filteredItems.length > 0 ? (
        <div className="admin-media-picker-grid">
          {filteredItems.map((item) => {
            const checked = isMultiple
              ? draftSelectedIds.includes(item.id)
              : selectedIds.has(item.id);
            return (
              <button
                type="button"
                key={item.id}
                className="admin-media-picker-option"
                aria-pressed={checked}
                onClick={() => toggleLibraryItem(item)}
              >
                <span className="admin-media-picker-image">
                  <Image
                    src={item.publicUrl}
                    alt=""
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </span>
                <span
                  className="admin-media-picker-label"
                  title={item.label}
                >
                  {item.label}
                </span>
                {isMultiple ? (
                  <span className="admin-media-picker-check">
                    {checked ? "Đã chọn" : "Chọn"}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : (
        <Empty description="Không có ảnh phù hợp" className="admin-media-empty" />
      )}
    </>
  );

  const uploadContent = (
    <div className="admin-media-picker-upload">
      <div>
        <strong>
          {isMultiple ? "Tải nhiều ảnh mới từ máy" : "Tải ảnh mới từ máy"}
        </strong>
        <p>
          JPEG, PNG, WebP hoặc AVIF; tối đa {maximumSize / 1024 / 1024} MB
          mỗi ảnh. Chọn file để xem preview; ảnh chỉ được tải lên Media Library
          sau khi bạn xác nhận.
        </p>
      </div>
      <div className="admin-media-upload-actions">
        <Button
          icon={<Upload size={16} aria-hidden="true" />}
          disabled={pending}
          onClick={() => fileInputRef.current?.click()}
        >
          {draftUploads.length > 0
            ? isMultiple ? "Thêm ảnh" : "Đổi ảnh"
            : isMultiple ? "Chọn nhiều ảnh từ máy" : "Chọn ảnh từ máy"}
        </Button>
        <Button
          type="primary"
          icon={<Upload size={16} aria-hidden="true" />}
          loading={pending}
          disabled={draftUploads.length === 0}
          onClick={confirmDraftUploads}
        >
          {pending
            ? "Đang tải ảnh..."
            : `Xác nhận tải ${draftUploads.length} ảnh`}
        </Button>
        {draftUploads.length > 0 ? (
          <Button
            type="text"
            icon={<X size={16} aria-hidden="true" />}
            disabled={pending}
            onClick={clearDraftUploads}
          >
            Bỏ chọn tất cả
          </Button>
        ) : null}
      </div>
      <div
        className={`admin-media-upload-preview admin-media-picker-inline-preview${
          draftUploads.length > 0 ? " has-files" : ""
        }`}
        aria-live="polite"
      >
        {draftUploads.length > 0 ? (
          <div className="admin-media-upload-preview-grid">
            {draftUploads.map((draft) => (
              <article
                className={`admin-media-upload-draft is-${draft.status}`}
                key={draft.id}
              >
                <span className="admin-media-upload-preview-image">
                  <Image
                    src={draft.previewUrl}
                    alt={draft.alt.trim() || draft.file.name}
                    fill
                    unoptimized
                    sizes="220px"
                    className="object-cover"
                  />
                </span>
                <div className="admin-media-upload-preview-copy">
                  <div className="admin-media-upload-preview-name">
                    <strong title={draft.file.name}>{draft.file.name}</strong>
                    <Button
                      type="text"
                      size="small"
                      icon={<X size={15} aria-hidden="true" />}
                      aria-label={`Bỏ chọn ${draft.file.name}`}
                      disabled={pending}
                      onClick={() => removeDraftUpload(draft.id)}
                    />
                  </div>
                  <small>
                    {formatBytes(draft.file.size)} ·{" "}
                    {draft.file.type.replace("image/", "").toUpperCase()}
                  </small>
                  <Input
                    value={draft.alt}
                    onChange={(event) =>
                      updateDraftUpload(draft.id, { alt: event.target.value })}
                    maxLength={300}
                    placeholder="Alt text cho ảnh"
                    aria-label={`Alt text cho ${draft.file.name}`}
                    disabled={pending}
                  />
                  {draft.status === "uploading" ? (
                    <span className="admin-media-upload-status">
                      <Spin size="small" /> Đang tải lên...
                    </span>
                  ) : draft.error ? (
                    <span className="admin-media-upload-error">
                      {draft.error}
                    </span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <span className="admin-media-upload-placeholder">
            <Upload size={28} aria-hidden="true" />
            <strong>Preview ảnh</strong>
            <small>Chọn một hoặc nhiều ảnh để kiểm tra trước khi upload.</small>
          </span>
        )}
      </div>
      <input
        ref={fileInputRef}
        className="admin-media-upload-input"
        type="file"
        accept={acceptedMediaImageTypes}
        multiple={isMultiple}
        disabled={pending}
        hidden
        onChange={(event) => {
          const files = event.target.files
            ? Array.from(event.target.files)
            : [];
          event.target.value = "";
          selectLocalFiles(files);
        }}
      />
    </div>
  );

  return (
    <div className="admin-media-picker-field">
      {selectedItems.length > 0 && props.showSelectionPreview !== false ? (
        <div className={`admin-media-picker-current-list${
          isMultiple ? " is-multiple" : ""
        }`}>
          {selectedItems.map((selected) => (
            <div className="admin-media-picker-current" key={selected.id}>
              <div className="admin-media-picker-thumb">
                <Image
                  src={selected.publicUrl}
                  alt=""
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </div>
              <span title={selected.label}>{selected.label}</span>
              {isMultiple ? (
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<Trash2 size={14} aria-hidden="true" />}
                  aria-label={`Bỏ ${selected.label}`}
                  onClick={() =>
                    emitSelection(
                      selectedItems.filter((item) => item.id !== selected.id),
                    )}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : selectedItems.length === 0 ? (
        <span className="admin-media-picker-empty">
          {isMultiple ? "Chưa chọn ảnh nào" : "Chưa chọn ảnh"}
        </span>
      ) : null}
      <div className="admin-media-picker-actions">
        <Button
          icon={<Images size={16} aria-hidden="true" />}
          onClick={() => showPicker("library")}
        >
          Chọn từ thư viện
        </Button>
        <Button
          icon={<Upload size={16} aria-hidden="true" />}
          onClick={() => showPicker("upload")}
        >
          Tải từ máy
        </Button>
        {!isMultiple && selectedItems[0] ? (
          <Button
            type="text"
            danger
            icon={<Trash2 size={16} aria-hidden="true" />}
            aria-label={`Bỏ ${label.toLocaleLowerCase("vi-VN")} đã chọn`}
            onClick={() => emitSelection([])}
          />
        ) : null}
      </div>

      <AdminModal
        title={isMultiple
          ? `Chọn nhiều ${label.toLocaleLowerCase("vi-VN")}`
          : `Chọn ${label.toLocaleLowerCase("vi-VN")}`}
        open={open}
        footer={isMultiple
          ? [
              <Button key="cancel" disabled={pending} onClick={closePicker}>
                Hủy
              </Button>,
              <Button
                key="confirm"
                type="primary"
                disabled={draftSelectedIds.length === 0 || pending}
                onClick={confirmMultipleSelection}
              >
                Dùng {draftSelectedIds.length} ảnh
              </Button>,
            ]
          : null}
        width={960}
        closable={!pending}
        maskClosable={!pending}
        onCancel={closePicker}
        destroyOnHidden
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "library", label: "Media Library", children: libraryContent },
            { key: "upload", label: "Tải từ máy", children: uploadContent },
          ]}
        />
      </AdminModal>
    </div>
  );
}
