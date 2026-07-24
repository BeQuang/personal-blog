"use client";

import { App, Button, Empty, Input, Tabs } from "antd";
import { Images, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState, useTransition } from "react";

import { AdminModal } from "@/components/admin/AdminModal";
import {
  acceptedMediaImageTypes,
  maximumAvatarImageSizeBytes,
  maximumMediaImageSizeBytes,
  uploadMediaImage,
} from "@/lib/media-image-upload";
import type { MediaPurpose } from "@/types";

export interface AdminMediaPickerOption {
  id: string;
  label: string;
  publicUrl: string;
}

interface AdminMediaPickerProps {
  items: readonly AdminMediaPickerOption[];
  value?: string;
  label: string;
  purpose: MediaPurpose;
  onChange: (value: { id: string; publicUrl: string } | null) => void;
}

export function AdminMediaPicker({
  items,
  value,
  label,
  purpose,
  onChange,
}: AdminMediaPickerProps) {
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("library");
  const [query, setQuery] = useState("");
  const [alt, setAlt] = useState("");
  const [uploadedItems, setUploadedItems] = useState<AdminMediaPickerOption[]>([]);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const availableItems = useMemo(() => {
    const uniqueItems = new Map<string, AdminMediaPickerOption>();
    for (const item of uploadedItems) uniqueItems.set(item.id, item);
    for (const item of items) uniqueItems.set(item.id, item);
    return [...uniqueItems.values()];
  }, [items, uploadedItems]);
  const selected = availableItems.find((item) => item.id === value);
  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi-VN");
    return normalized
      ? availableItems.filter((item) => item.label.toLocaleLowerCase("vi-VN").includes(normalized))
      : availableItems;
  }, [availableItems, query]);
  const maximumSize = purpose === "avatar"
    ? maximumAvatarImageSizeBytes
    : maximumMediaImageSizeBytes;

  const showPicker = (tab: "library" | "upload") => {
    setActiveTab(tab);
    setOpen(true);
  };

  const uploadFile = (file: File) => {
    startTransition(async () => {
      try {
        const asset = await uploadMediaImage({ file, purpose, alt });
        const option = {
          id: asset.id,
          label: asset.originalFilename,
          publicUrl: asset.publicUrl,
        };
        setUploadedItems((current) => [
          option,
          ...current.filter((item) => item.id !== option.id),
        ]);
        onChange({ id: option.id, publicUrl: option.publicUrl });
        setAlt("");
        setOpen(false);
        void message.success("Đã tải ảnh lên Media Library và chọn vào form.");
      } catch (error) {
        void message.error(error instanceof Error ? error.message : "Tải ảnh thất bại.");
      }
    });
  };

  const libraryContent = (
    <>
      <Input.Search
        allowClear
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tìm theo tên file..."
        aria-label="Tìm ảnh trong Media Library"
      />
      {filteredItems.length > 0 ? (
        <div className="admin-media-picker-grid">
          {filteredItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className="admin-media-picker-option"
              aria-pressed={item.id === value}
              onClick={() => {
                onChange({ id: item.id, publicUrl: item.publicUrl });
                setOpen(false);
              }}
            >
              <span className="admin-media-picker-image">
                <Image src={item.publicUrl} alt="" fill sizes="160px" className="object-cover" />
              </span>
              <span title={item.label}>{item.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <Empty description="Không có ảnh phù hợp" className="admin-media-empty" />
      )}
    </>
  );

  const uploadContent = (
    <div className="admin-media-picker-upload">
      <div>
        <strong>Tải ảnh mới từ máy</strong>
        <p>
          JPEG, PNG, WebP hoặc AVIF; tối đa {maximumSize / 1024 / 1024} MB.
          Ảnh sẽ được lưu vào Media Library và tự động chọn vào form.
        </p>
      </div>
      <Input
        value={alt}
        onChange={(event) => setAlt(event.target.value)}
        maxLength={300}
        placeholder="Alt text mô tả ảnh (khuyến nghị)"
        aria-label="Alt text cho ảnh tải lên"
        disabled={pending}
      />
      <Button
        type="primary"
        icon={<Upload size={16} aria-hidden="true" />}
        loading={pending}
        onClick={() => fileInputRef.current?.click()}
      >
        {pending ? "Đang tải ảnh..." : "Chọn ảnh từ máy"}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedMediaImageTypes}
        disabled={pending}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) uploadFile(file);
        }}
      />
    </div>
  );

  return (
    <div className="admin-media-picker-field">
      {selected ? (
        <div className="admin-media-picker-current">
          <div className="admin-media-picker-thumb">
            <Image src={selected.publicUrl} alt="" fill sizes="72px" className="object-cover" />
          </div>
          <span title={selected.label}>{selected.label}</span>
        </div>
      ) : (
        <span className="admin-media-picker-empty">Chưa chọn ảnh</span>
      )}
      <div className="admin-media-picker-actions">
        <Button icon={<Images size={16} aria-hidden="true" />} onClick={() => showPicker("library")}>
          Chọn từ thư viện
        </Button>
        <Button icon={<Upload size={16} aria-hidden="true" />} onClick={() => showPicker("upload")}>
          Tải từ máy
        </Button>
        {selected ? (
          <Button
            type="text"
            danger
            icon={<Trash2 size={16} aria-hidden="true" />}
            aria-label={`Bỏ ${label.toLocaleLowerCase("vi-VN")} đã chọn`}
            onClick={() => onChange(null)}
          />
        ) : null}
      </div>

      <AdminModal
        title={`Chọn ${label.toLocaleLowerCase("vi-VN")}`}
        open={open}
        footer={null}
        width={860}
        onCancel={() => setOpen(false)}
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
