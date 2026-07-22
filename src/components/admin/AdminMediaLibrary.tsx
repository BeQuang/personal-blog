"use client";

import { App, Button, Empty, Input, Pagination, Select, Tag } from "antd";
import { Copy, Search, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  confirmMediaUploadAction,
  createMediaUploadAction,
  deleteMediaAssetAction,
} from "@/actions/media.actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import type {
  MediaAssetItem,
  MediaLibraryPage,
  MediaMimeType,
  MediaPurpose,
} from "@/types";

const maximumImageSizeBytes = 10 * 1024 * 1024;
const maximumAvatarSizeBytes = 5 * 1024 * 1024;
const allowedMimeTypes: readonly MediaMimeType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const purposeOptions: { value: MediaPurpose; label: string }[] = [
  { value: "gallery", label: "Gallery" },
  { value: "post_cover", label: "Post cover" },
  { value: "post_thumbnail", label: "Post thumbnail" },
  { value: "avatar", label: "Avatar" },
  { value: "site_banner", label: "Site banner" },
  { value: "event_banner", label: "Event banner" },
  { value: "campaign_banner", label: "Campaign banner" },
];

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

async function readImageDimensions(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  } catch {
    return { width: null, height: null };
  }
}

interface AdminMediaLibraryProps {
  data: MediaLibraryPage;
  showHeader?: boolean;
  filters: {
    query: string;
    mimeType: MediaMimeType | "all";
    purpose: MediaPurpose | "all";
  };
}

export function AdminMediaLibrary({ data, filters, showHeader = true }: AdminMediaLibraryProps) {
  const { message, modal } = App.useApp();
  const router = useRouter();
  const [query, setQuery] = useState(filters.query);
  const [purpose, setPurpose] = useState<MediaPurpose>("gallery");
  const [alt, setAlt] = useState("");
  const [selected, setSelected] = useState<MediaAssetItem | null>(null);
  const [pending, startTransition] = useTransition();

  const navigate = (changes: Record<string, string | number>) => {
    const parameters = new URLSearchParams();
    const values = {
      q: filters.query,
      mime: filters.mimeType,
      purpose: filters.purpose,
      page: data.page,
      ...changes,
    };
    for (const [key, value] of Object.entries(values)) {
      if (value && value !== "all" && value !== 1) parameters.set(key, String(value));
    }
    router.replace(`/admin/gallery${parameters.size > 0 ? `?${parameters}` : ""}`);
  };

  const uploadFile = (file: File) => {
    if (!allowedMimeTypes.includes(file.type as MediaMimeType)) {
      void message.error("Chỉ chấp nhận JPEG, PNG, WebP hoặc AVIF.");
      return;
    }
    const maximumSize = purpose === "avatar"
      ? maximumAvatarSizeBytes
      : maximumImageSizeBytes;
    if (file.size <= 0 || file.size > maximumSize) {
      void message.error(`File phải có dung lượng từ 1 byte đến ${maximumSize / 1024 / 1024} MB.`);
      return;
    }

    startTransition(async () => {
      const upload = await createMediaUploadAction({
        originalFilename: file.name,
        mimeType: file.type as MediaMimeType,
        sizeBytes: file.size,
        purpose,
      });
      if (!upload.success || !upload.data) {
        void message.error(upload.message);
        return;
      }

      try {
        const response = await fetch(upload.data.uploadUrl, {
          method: "PUT",
          headers: upload.data.headers,
          body: file,
        });
        if (!response.ok) throw new Error(`R2 upload failed with HTTP ${response.status}`);
        const dimensions = await readImageDimensions(file);
        const confirmed = await confirmMediaUploadAction({
          uploadTicket: upload.data.uploadTicket,
          alt: alt.trim() || null,
          ...dimensions,
        });
        if (!confirmed.success) throw new Error(confirmed.message);
        void message.success(confirmed.message);
        setAlt("");
        router.refresh();
      } catch (error) {
        void message.error(error instanceof Error ? error.message : "Upload R2 thất bại.");
      }
    });
  };

  const confirmDelete = (item: MediaAssetItem) => {
    modal.confirm({
      title: `Xóa “${item.originalFilename}”?`,
      content: "Object sẽ bị xóa khỏi R2. Media đang được nội dung khác sử dụng sẽ bị từ chối.",
      okText: "Xóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: async () => {
        const result = await deleteMediaAssetAction(item.id);
        if (!result.success) {
          void message.error(result.message);
          throw new Error(result.message);
        }
        setSelected(null);
        void message.success(result.message);
        router.refresh();
      },
    });
  };

  return (
    <>
      {showHeader ? <AdminPageHeader
        title="Media Library"
        description="Upload ảnh trực tiếp lên Cloudflare R2 bằng presigned URL và quản lý media thật trong PostgreSQL."
      /> : null}

      <section className="admin-panel admin-media-upload-panel" aria-labelledby="media-upload-title">
        <div>
          <h2 id="media-upload-title">Upload ảnh</h2>
          <p>JPEG, PNG, WebP hoặc AVIF; tối đa 10 MB. File không đi qua Next.js server.</p>
        </div>
        <div className="admin-media-upload-controls">
          <Select
            value={purpose}
            onChange={setPurpose}
            options={purposeOptions}
            aria-label="Mục đích media"
          />
          <Input
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            maxLength={300}
            placeholder="Alt text (khuyến nghị)"
            aria-label="Alt text cho ảnh"
          />
          <label className="ant-btn ant-btn-primary admin-media-upload-button">
            <Upload size={16} aria-hidden="true" />
            {pending ? "Đang upload..." : "Chọn file"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={pending}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) uploadFile(file);
              }}
            />
          </label>
        </div>
      </section>

      <section className="admin-panel admin-media-library-panel" aria-label="Danh sách media">
        <div className="admin-media-toolbar">
          <Input
            allowClear
            value={query}
            prefix={<Search size={17} aria-hidden="true" />}
            placeholder="Tìm filename, alt hoặc object key..."
            onChange={(event) => setQuery(event.target.value)}
            onPressEnter={() => navigate({ q: query, page: 1 })}
            aria-label="Tìm media"
          />
          <Button onClick={() => navigate({ q: query, page: 1 })}>Tìm</Button>
          <Select
            value={filters.mimeType}
            aria-label="Lọc định dạng media"
            onChange={(value) => navigate({ mime: value, page: 1 })}
            options={[
              { value: "all", label: "Mọi định dạng" },
              { value: "image/jpeg", label: "JPEG" },
              { value: "image/png", label: "PNG" },
              { value: "image/webp", label: "WebP" },
              { value: "image/avif", label: "AVIF" },
            ]}
          />
          <Select
            value={filters.purpose}
            aria-label="Lọc mục đích media"
            onChange={(value) => navigate({ purpose: value, page: 1 })}
            options={[{ value: "all", label: "Mọi mục đích" }, ...purposeOptions]}
          />
        </div>

        {data.items.length > 0 ? (
          <div className="admin-media-layout">
            <div className="admin-media-grid">
              {data.items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="admin-media-card"
                  aria-pressed={selected?.id === item.id}
                  onClick={() => setSelected(item)}
                >
                  <span className="admin-media-card-image">
                    <Image
                      src={item.publicUrl}
                      alt={item.alt ?? item.originalFilename}
                      fill
                      sizes="(max-width: 768px) 50vw, 220px"
                      className="object-cover"
                    />
                  </span>
                  <span className="admin-media-card-copy">
                    <strong title={item.originalFilename}>{item.originalFilename}</strong>
                    <small>{formatBytes(item.sizeBytes)} · {item.extension.toUpperCase()}</small>
                  </span>
                </button>
              ))}
            </div>
            {selected ? (
              <aside className="admin-media-details" aria-label="Chi tiết media đã chọn">
                <h2>Chi tiết</h2>
                <p><strong>{selected.originalFilename}</strong></p>
                <Tag>{selected.purpose}</Tag>
                <dl>
                  <div><dt>MIME</dt><dd>{selected.mimeType}</dd></div>
                  <div><dt>Dung lượng</dt><dd>{formatBytes(selected.sizeBytes)}</dd></div>
                  <div><dt>Kích thước</dt><dd>{selected.width && selected.height ? `${selected.width}×${selected.height}` : "Chưa có"}</dd></div>
                </dl>
                <Button
                  block
                  icon={<Copy size={16} aria-hidden="true" />}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(selected.publicUrl);
                      void message.success("Đã copy URL.");
                    } catch {
                      void message.error("Không thể copy URL. Vui lòng thử lại.");
                    }
                  }}
                >
                  Copy URL
                </Button>
                <Button
                  block
                  danger
                  icon={<Trash2 size={16} aria-hidden="true" />}
                  onClick={() => confirmDelete(selected)}
                >
                  Xóa media
                </Button>
              </aside>
            ) : null}
          </div>
        ) : (
          <Empty description="Chưa có media phù hợp" className="admin-media-empty" />
        )}

        {data.total > data.pageSize ? (
          <Pagination
            current={data.page}
            pageSize={data.pageSize}
            total={data.total}
            showSizeChanger={false}
            onChange={(page) => navigate({ page })}
          />
        ) : null}
      </section>
    </>
  );
}
