"use client";

import { App, Button, Empty, Input, Select, Spin, Tag } from "antd";
import { Copy, Search, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { deleteMediaAssetAction } from "@/actions/media.actions";
import { useAdminListPage } from "@/components/admin/useAdminListPage";
import {
  acceptedMediaImageTypes,
  uploadMediaImage,
  validateMediaImageFile,
} from "@/lib/media-image-upload";
import type {
  MediaAssetItem,
  MediaLibraryPage,
  MediaLibrarySortBy,
  MediaMimeType,
  MediaPurpose,
} from "@/types";

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

interface AdminMediaLibraryProps {
  data: MediaLibraryPage;
  filters: {
    query: string;
    mimeType: MediaMimeType | "all";
    purpose: MediaPurpose | "all";
  };
}

interface MediaLibraryLoadChanges {
  page?: number;
  query?: string;
  mimeType?: MediaMimeType | "all";
  purpose?: MediaPurpose | "all";
  sortBy?: MediaLibrarySortBy;
  sortOrder?: "asc" | "desc";
}

type MediaLibraryLoadMode = "append" | "replace";
type DraftUploadStatus = "ready" | "uploading" | "failed";

interface DraftMediaUpload {
  id: string;
  file: File;
  previewUrl: string;
  alt: string;
  status: DraftUploadStatus;
  error?: string;
}

function getFileIdentity(file: File) {
  return [file.name, file.size, file.type, file.lastModified].join(":");
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function AdminMediaLibrary({
  data: initialPage,
  filters: initialFilters,
}: AdminMediaLibraryProps) {
  const { message, modal } = App.useApp();
  const [query, setQuery] = useState(initialFilters.query);
  const [filters, setFilters] = useState(initialFilters);
  const [purpose, setPurpose] = useState<MediaPurpose>("gallery");
  const [draftUploads, setDraftUploads] = useState<DraftMediaUpload[]>([]);
  const [items, setItems] = useState<MediaAssetItem[]>([
    ...initialPage.items,
  ]);
  const [selected, setSelected] = useState<MediaAssetItem | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftUploadsRef = useRef<DraftMediaUpload[]>([]);
  const mediaScrollRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const reportListError = useCallback((error: string) => {
    void message.error(error);
  }, [message]);
  const { data, load, loading } = useAdminListPage(
    "/api/admin/media",
    initialPage,
    reportListError,
  );

  const replaceDraftUploads = useCallback((uploads: DraftMediaUpload[]) => {
    draftUploadsRef.current = uploads;
    setDraftUploads(uploads);
  }, []);

  useEffect(() => () => {
    for (const upload of draftUploadsRef.current) {
      URL.revokeObjectURL(upload.previewUrl);
    }
  }, []);

  const clearDraftUploads = useCallback(() => {
    for (const upload of draftUploadsRef.current) {
      URL.revokeObjectURL(upload.previewUrl);
    }
    replaceDraftUploads([]);
  }, [replaceDraftUploads]);

  const removeDraftUpload = useCallback((id: string) => {
    const removed = draftUploadsRef.current.find((upload) => upload.id === id);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    replaceDraftUploads(
      draftUploadsRef.current.filter((upload) => upload.id !== id),
    );
  }, [replaceDraftUploads]);

  const updateDraftUpload = useCallback((
    id: string,
    changes: Partial<Pick<DraftMediaUpload, "alt" | "status" | "error">>,
  ) => {
    replaceDraftUploads(
      draftUploadsRef.current.map((upload) =>
        upload.id === id ? { ...upload, ...changes } : upload),
    );
  }, [replaceDraftUploads]);

  const loadLibrary = useCallback(async (
    changes: MediaLibraryLoadChanges,
    mode: MediaLibraryLoadMode = "replace",
  ) => {
    if (mode === "replace") setLoadMoreFailed(false);

    const values = {
      query: filters.query,
      mimeType: filters.mimeType,
      purpose: filters.purpose,
      page: data.page,
      pageSize: data.pageSize,
      sortBy: data.sortBy,
      sortOrder: data.sortOrder,
      ...changes,
    };

    setFilters({
      query: values.query,
      mimeType: values.mimeType,
      purpose: values.purpose,
    });

    const nextPage = await load(values);
    if (!nextPage) return null;

    setItems((currentItems) => {
      if (mode === "replace") return [...nextPage.items];

      const mergedItems = new Map(
        currentItems.map((item) => [item.id, item]),
      );
      for (const item of nextPage.items) mergedItems.set(item.id, item);
      return [...mergedItems.values()];
    });

    if (mode === "replace") {
      setSelected(null);
      mediaScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }

    return nextPage;
  }, [
    data.page,
    data.pageSize,
    data.sortBy,
    data.sortOrder,
    filters.mimeType,
    filters.purpose,
    filters.query,
    load,
  ]);

  const hasMore = data.page * data.pageSize < data.total;

  const loadNextPage = useCallback(async (retry = false) => {
    if (
      !hasMore
      || loading
      || loadingMore
      || pending
      || (loadMoreFailed && !retry)
    ) return;

    setLoadMoreFailed(false);
    setLoadingMore(true);
    try {
      const nextPage = await loadLibrary(
        { page: data.page + 1 },
        "append",
      );
      if (!nextPage) setLoadMoreFailed(true);
    } finally {
      setLoadingMore(false);
    }
  }, [
    data.page,
    hasMore,
    loadLibrary,
    loadMoreFailed,
    loading,
    loadingMore,
    pending,
  ]);

  useEffect(() => {
    const root = mediaScrollRef.current;
    const target = loadMoreSentinelRef.current;
    if (!root || !target || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadNextPage();
      },
      {
        root,
        rootMargin: "240px 0px",
        threshold: 0.01,
      },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadNextPage]);

  const selectFiles = (files: readonly File[]) => {
    const identities = new Set(
      draftUploadsRef.current.map((upload) => getFileIdentity(upload.file)),
    );
    const accepted: DraftMediaUpload[] = [];
    const rejected: string[] = [];
    let duplicateCount = 0;

    for (const file of files) {
      const identity = getFileIdentity(file);
      if (identities.has(identity)) {
        duplicateCount += 1;
        continue;
      }

      try {
        validateMediaImageFile(file, purpose);
        identities.add(identity);
        accepted.push({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          alt: "",
          status: "ready",
        });
      } catch (error) {
        rejected.push(
          `${file.name}: ${getErrorMessage(error, "File ảnh không hợp lệ.")}`,
        );
      }
    }

    if (accepted.length > 0) {
      replaceDraftUploads([...draftUploadsRef.current, ...accepted]);
    }

    if (rejected.length > 0) {
      void message.warning(
        `Đã bỏ qua ${rejected.length} ảnh không hợp lệ. ${rejected[0]}`,
      );
    } else if (duplicateCount > 0) {
      void message.info(`Đã bỏ qua ${duplicateCount} ảnh trùng trong hàng chờ.`);
    }
  };

  const confirmUpload = () => {
    if (draftUploadsRef.current.length === 0) return;

    startTransition(async () => {
      const batch = [...draftUploadsRef.current];
      const validUploads: DraftMediaUpload[] = [];

      for (const upload of batch) {
        try {
          validateMediaImageFile(upload.file, purpose);
          validUploads.push(upload);
          updateDraftUpload(upload.id, {
            status: "ready",
            error: undefined,
          });
        } catch (error) {
          updateDraftUpload(upload.id, {
            status: "failed",
            error: getErrorMessage(error, "File ảnh không hợp lệ."),
          });
        }
      }

      if (validUploads.length === 0) {
        void message.warning("Không có ảnh hợp lệ để tải lên.");
        return;
      }

      const uploadedIds = new Set<string>();
      let failedCount = batch.length - validUploads.length;

      for (const upload of validUploads) {
        updateDraftUpload(upload.id, {
          status: "uploading",
          error: undefined,
        });

        try {
          await uploadMediaImage({
            file: upload.file,
            purpose,
            alt: upload.alt,
          });
          uploadedIds.add(upload.id);
        } catch (error) {
          failedCount += 1;
          updateDraftUpload(upload.id, {
            status: "failed",
            error: getErrorMessage(error, "Tải ảnh thất bại."),
          });
        }
      }

      if (uploadedIds.size > 0) {
        for (const upload of batch) {
          if (uploadedIds.has(upload.id)) {
            URL.revokeObjectURL(upload.previewUrl);
          }
        }
        replaceDraftUploads(
          draftUploadsRef.current.filter(
            (upload) => !uploadedIds.has(upload.id),
          ),
        );
        await loadLibrary({ page: 1 }, "replace");
      }

      if (failedCount > 0) {
        void message.warning(
          `Đã tải thành công ${uploadedIds.size}/${batch.length} ảnh. ` +
          `${failedCount} ảnh lỗi được giữ lại để thử lại.`,
        );
      } else {
        void message.success(
          `Đã tải thành công ${uploadedIds.size} ảnh lên Media Library.`,
        );
      }
    });
  };

  const confirmDelete = (item: MediaAssetItem) => {
    modal.confirm({
      title: `Xóa “${item.originalFilename}”?`,
      content:
        "Object sẽ bị xóa khỏi R2. Media đang được nội dung khác sử dụng sẽ bị từ chối.",
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
        await loadLibrary({ page: 1 }, "replace");
      },
    });
  };

  return (
    <div className="admin-gallery-tab-content admin-media-library-tab">
      <header className="admin-gallery-tab-header">
        <div>
          <h2>Kho tệp hình ảnh</h2>
          <p>
            Tải lên, tìm kiếm và quản lý các tệp ảnh dùng chung cho nội dung
            website.
          </p>
        </div>
      </header>

      <div className="admin-media-columns">
        <section
          className="admin-panel admin-media-upload-panel"
          aria-labelledby="media-upload-title"
        >
        <div className="admin-media-upload-layout">
          <div className="admin-media-upload-form">
            <div className="admin-media-upload-heading">
              <h2 id="media-upload-title">Upload ảnh</h2>
              <p>
                Chọn một hoặc nhiều ảnh JPEG, PNG, WebP hoặc AVIF; tối đa 10 MB
                mỗi ảnh. Ảnh chỉ được tải lên sau khi bạn xác nhận.
              </p>
            </div>

            <div className="admin-media-upload-fields is-single">
              <label>
                <span>Mục đích sử dụng</span>
                <Select
                  value={purpose}
                  disabled={pending}
                  onChange={(value) => {
                    setPurpose(value);
                    replaceDraftUploads(
                      draftUploadsRef.current.map((upload) => {
                        try {
                          validateMediaImageFile(upload.file, value);
                          return {
                            ...upload,
                            status: "ready" as const,
                            error: undefined,
                          };
                        } catch (error) {
                          return {
                            ...upload,
                            status: "failed" as const,
                            error: getErrorMessage(
                              error,
                              "File ảnh không hợp lệ.",
                            ),
                          };
                        }
                      }),
                    );
                  }}
                  options={purposeOptions}
                  aria-label="Mục đích media"
                />
                <small>
                  Alt text được nhập riêng cho từng ảnh trong phần preview.
                </small>
              </label>
            </div>

            <div className="admin-media-upload-actions">
              <Button
                icon={<Upload size={16} aria-hidden="true" />}
                disabled={pending}
                onClick={() => fileInputRef.current?.click()}
              >
                {draftUploads.length > 0 ? "Thêm ảnh" : "Chọn ảnh"}
              </Button>
              <Button
                type="primary"
                icon={<Upload size={16} aria-hidden="true" />}
                loading={pending}
                disabled={draftUploads.length === 0}
                onClick={confirmUpload}
              >
                Xác nhận upload
                {draftUploads.length > 0 ? ` (${draftUploads.length})` : ""}
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
              <input
                ref={fileInputRef}
                className="admin-media-upload-input"
                type="file"
                accept={acceptedMediaImageTypes}
                multiple
                disabled={pending}
                onChange={(event) => {
                  const files = event.target.files
                    ? Array.from(event.target.files)
                    : [];
                  event.target.value = "";
                  if (files.length > 0) selectFiles(files);
                }}
              />
            </div>
          </div>

          <div
            className={`admin-media-upload-preview${
              draftUploads.length > 0 ? " has-files" : ""
            }`}
            aria-live="polite"
          >
            {draftUploads.length > 0 ? (
              <div className="admin-media-upload-preview-grid">
                {draftUploads.map((upload) => (
                  <article
                    key={upload.id}
                    className={`admin-media-upload-draft is-${upload.status}`}
                  >
                    <span className="admin-media-upload-preview-image">
                      <Image
                        src={upload.previewUrl}
                        alt={upload.alt.trim() || upload.file.name}
                        fill
                        unoptimized
                        sizes="220px"
                        className="object-cover"
                      />
                    </span>
                    <div className="admin-media-upload-preview-copy">
                      <div className="admin-media-upload-preview-name">
                        <strong title={upload.file.name}>
                          {upload.file.name}
                        </strong>
                        <Button
                          type="text"
                          size="small"
                          icon={<X size={15} aria-hidden="true" />}
                          disabled={pending}
                          aria-label={`Bỏ chọn ${upload.file.name}`}
                          onClick={() => removeDraftUpload(upload.id)}
                        />
                      </div>
                      <small>
                        {formatBytes(upload.file.size)} ·{" "}
                        {upload.file.type.replace("image/", "").toUpperCase()}
                      </small>
                      <Input
                        value={upload.alt}
                        disabled={pending}
                        maxLength={300}
                        placeholder="Alt text cho ảnh"
                        aria-label={`Alt text cho ${upload.file.name}`}
                        onChange={(event) =>
                          updateDraftUpload(upload.id, {
                            alt: event.target.value,
                          })}
                      />
                      {upload.status === "uploading" ? (
                        <span className="admin-media-upload-status">
                          <Spin size="small" />
                          Đang tải lên...
                        </span>
                      ) : upload.error ? (
                        <span className="admin-media-upload-error">
                          {upload.error}
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
        </div>
        </section>

        <section
          className="admin-panel admin-media-library-panel"
          aria-label="Danh sách media"
        >
        <div className="admin-media-toolbar">
          <Input
            allowClear
            value={query}
            prefix={<Search size={17} aria-hidden="true" />}
            placeholder="Tìm filename, alt hoặc object key..."
            onChange={(event) => setQuery(event.target.value)}
            onPressEnter={() => void loadLibrary({ query, page: 1 })}
            aria-label="Tìm media"
          />
          <Button
            loading={loading && !loadingMore}
            onClick={() => void loadLibrary({ query, page: 1 })}
          >
            Tìm
          </Button>
          <Select
            value={filters.mimeType}
            aria-label="Lọc định dạng media"
            onChange={(value) =>
              void loadLibrary({ mimeType: value, page: 1 })}
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
            onChange={(value) =>
              void loadLibrary({ purpose: value, page: 1 })}
            options={[
              { value: "all", label: "Mọi mục đích" },
              ...purposeOptions,
            ]}
          />
          <Select
            value={`${data.sortBy}:${data.sortOrder}`}
            aria-label="Sắp xếp Media Library"
            onChange={(value) => {
              const [sortBy, sortOrder] = value.split(":") as [
                MediaLibrarySortBy,
                "asc" | "desc",
              ];
              void loadLibrary({ sortBy, sortOrder, page: 1 });
            }}
            options={[
              { value: "createdAt:desc", label: "Mới nhất" },
              { value: "createdAt:asc", label: "Cũ nhất" },
              { value: "originalFilename:asc", label: "Tên A–Z" },
              { value: "originalFilename:desc", label: "Tên Z–A" },
              { value: "sizeBytes:desc", label: "Dung lượng lớn nhất" },
              { value: "sizeBytes:asc", label: "Dung lượng nhỏ nhất" },
            ]}
          />
        </div>

        {items.length > 0 ? (
          <div
            ref={mediaScrollRef}
            className={`admin-media-layout${selected ? " has-details" : ""}`}
          >
            <div className="admin-media-grid-column">
              <div className="admin-media-grid">
                {items.map((item) => (
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
                        loading="lazy"
                        sizes="(max-width: 768px) 50vw, 220px"
                        className="object-cover"
                      />
                    </span>
                    <span className="admin-media-card-copy">
                      <strong title={item.originalFilename}>
                        {item.originalFilename}
                      </strong>
                      <small>
                        {formatBytes(item.sizeBytes)} ·{" "}
                        {item.extension.toUpperCase()}
                      </small>
                    </span>
                  </button>
                ))}
              </div>

              <div
                ref={loadMoreSentinelRef}
                className="admin-media-load-status"
                aria-live="polite"
              >
                {loadingMore ? (
                  <>
                    <Spin size="small" />
                    <span>Đang tải thêm ảnh...</span>
                  </>
                ) : loadMoreFailed ? (
                  <Button size="small" onClick={() => void loadNextPage(true)}>
                    Không thể tải thêm — thử lại
                  </Button>
                ) : hasMore ? (
                  <span>Cuộn xuống để tải thêm ảnh</span>
                ) : (
                  <span>Đã hiển thị tất cả {data.total} ảnh</span>
                )}
              </div>
            </div>

            {selected ? (
              <aside
                className="admin-media-details"
                aria-label="Chi tiết media đã chọn"
              >
                <h2>Chi tiết</h2>
                <p><strong>{selected.originalFilename}</strong></p>
                <Tag>{selected.purpose}</Tag>
                <dl>
                  <div><dt>MIME</dt><dd>{selected.mimeType}</dd></div>
                  <div>
                    <dt>Dung lượng</dt>
                    <dd>{formatBytes(selected.sizeBytes)}</dd>
                  </div>
                  <div>
                    <dt>Kích thước</dt>
                    <dd>
                      {selected.width && selected.height
                        ? `${selected.width}×${selected.height}`
                        : "Chưa có"}
                    </dd>
                  </div>
                </dl>
                <Button
                  block
                  icon={<Copy size={16} aria-hidden="true" />}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(selected.publicUrl);
                      void message.success("Đã copy URL.");
                    } catch {
                      void message.error(
                        "Không thể copy URL. Vui lòng thử lại.",
                      );
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
        ) : loading ? (
          <div className="admin-media-loading">
            <Spin />
            <span>Đang tải ảnh...</span>
          </div>
        ) : (
          <Empty
            description="Chưa có media phù hợp"
            className="admin-media-empty"
          />
        )}
        </section>
      </div>
    </div>
  );
}
