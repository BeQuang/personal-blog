"use client";

import { App, Button, Flex, Input, Select, Space, Switch, Table, Tag, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { EyeOff, Pencil, Plus, RefreshCw, Search, Send, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import {
  createExternalVideoAction,
  deleteVideoAction,
  setVideoFeaturedAction,
  setVideoPublishedAction,
  updateVideoAction,
} from "@/actions/videos.actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminListPage } from "@/components/admin/useAdminListPage";
import { AdminVideoEditorModal } from "@/components/admin/AdminVideoEditorModal";
import {
  AdminVideoUploadPanel,
  allowedVideoMimeTypes,
  maximumVideoSizeBytes,
} from "@/components/admin/AdminVideoUploadPanel";
import { adminTablePaginationDefaults } from "@/components/admin/admin-table.config";
import { beginRequestProgress } from "@/lib/loading-progress";
import type {
  ActionFieldErrors,
  AdminListPage,
  AdminVideo,
  AdminVideoListQuery,
  CreateVideoUploadData,
  CreateVideoUploadInput,
  MediaOption,
  VideoMutationInput,
} from "@/types";
import { formatDate } from "@/utils/date";

interface AdminVideosManagerProps {
  initialPage: AdminListPage<AdminVideo, AdminVideoListQuery["sortBy"]>;
  mediaOptions: readonly MediaOption[];
  canWrite: boolean;
  canPublish: boolean;
}

const processingLabels: Record<AdminVideo["processingStatus"], string> = {
  pending: "Chờ upload",
  uploading: "Đang upload",
  processing: "Đang xử lý",
  ready: "Sẵn sàng",
  failed: "Thất bại",
  deleted: "Đã xóa",
};
const processingColors: Record<AdminVideo["processingStatus"], string> = {
  pending: "default",
  uploading: "blue",
  processing: "processing",
  ready: "success",
  failed: "error",
  deleted: "default",
};

function formatDuration(seconds: number | null) {
  if (seconds === null) return "—";
  const rounded = Math.max(0, Math.round(seconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const remaining = rounded % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`
    : `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function parseUploadResponse(value: unknown): CreateVideoUploadData | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  return typeof record.videoId === "string" &&
    typeof record.uploadId === "string" &&
    typeof record.uploadUrl === "string"
    ? { videoId: record.videoId, uploadId: record.uploadId, uploadUrl: record.uploadUrl }
    : null;
}

function parseResponseError(value: unknown) {
  if (typeof value !== "object" || value === null || !("error" in value)) return null;
  return typeof value.error === "string" ? value.error : null;
}

function putFile(uploadUrl: string, file: File, onProgress: (value: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", uploadUrl);
    request.setRequestHeader("Content-Type", file.type);
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error(`Mux upload thất bại với HTTP ${request.status}.`));
    });
    request.addEventListener("error", () => reject(new Error("Không thể kết nối tới Mux.")));
    request.addEventListener("abort", () => reject(new Error("Upload video đã bị hủy.")));
    request.send(file);
  });
}

export function AdminVideosManager({ initialPage, mediaOptions, canWrite, canPublish }: AdminVideosManagerProps) {
  const { message, modal } = App.useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AdminVideo | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const initialFilterRender = useRef(true);
  const reportListError = useCallback((error: string) => { void message.error(error); }, [message]);
  const { data, load, loading, reload } = useAdminListPage(
    "/api/admin/videos",
    initialPage,
    reportListError,
  );
  const hasProcessingVideos = data.items.some((video) =>
    video.processingStatus === "uploading" || video.processingStatus === "processing");

  useEffect(() => {
    if (!hasProcessingVideos) return;
    const timer = window.setInterval(() => void reload(), 10_000);
    return () => window.clearInterval(timer);
  }, [hasProcessingVideos, reload]);

  useEffect(() => {
    if (initialFilterRender.current) {
      initialFilterRender.current = false;
      return;
    }
    const timeout = window.setTimeout(() => {
      void load({
        page: 1,
        pageSize: data.pageSize,
        query,
        status,
        sortBy: data.sortBy,
        sortOrder: data.sortOrder,
      });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [data.pageSize, data.sortBy, data.sortOrder, load, query, status]);

  const requestAndUpload = async (input: CreateVideoUploadInput, file: File, stateId: string) => {
    if (!allowedVideoMimeTypes.includes(file.type as (typeof allowedVideoMimeTypes)[number])) {
      void message.error("Chỉ chấp nhận MP4, MOV, WebM hoặc MKV.");
      return false;
    }
    if (file.size <= 0 || file.size > maximumVideoSizeBytes) {
      void message.error("Video phải có dung lượng từ 1 byte đến 5 GB.");
      return false;
    }
    setUploadingId(stateId);
    setProgress(0);
    const finishProgress = beginRequestProgress();
    try {
      const response = await fetch("/api/uploads/video-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body: unknown = await response.json();
      const upload = parseUploadResponse(body);
      if (!response.ok || !upload) {
        throw new Error(parseResponseError(body) ?? "Không thể tạo URL upload Mux.");
      }
      await putFile(upload.uploadUrl, file, setProgress);
      setProgress(100);
      void message.success("Upload hoàn tất. Mux đang xử lý video; trạng thái sẽ tự cập nhật.");
      await reload();
      router.refresh();
      return true;
    } catch (error) {
      void message.error(error instanceof Error ? error.message : "Upload video thất bại.");
      return false;
    } finally {
      finishProgress();
      setUploadingId(null);
      setProgress(null);
    }
  };

  const runAction = (operation: () => Promise<{ success: boolean; message: string }>) => {
    startTransition(async () => {
      const result = await operation();
      if (result.success) {
        void message.success(result.message);
        await reload();
        router.refresh();
      } else {
        void message.error(result.message);
      }
    });
  };

  const remove = (video: AdminVideo) => {
    modal.confirm({
      title: `Xóa “${video.title}”?`,
      content: video.muxAssetId
        ? "Thao tác này sẽ xóa Mux asset đang được video tham chiếu và lưu trữ record trong database."
        : "Video sẽ được lưu trữ và biến mất khỏi public.",
      okText: "Xóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: async () => {
        const result = await deleteVideoAction(video.id, Boolean(video.muxAssetId));
        if (!result.success) {
          void message.error(result.message);
          throw new Error(result.message);
        }
        void message.success(result.message);
        await reload();
        router.refresh();
      },
    });
  };

  const columns: TableColumnsType<AdminVideo> = [
    {
      title: "Video",
      key: "video",
      width: 360,
      render: (_, video) => (
        <div className="admin-video-title-cell">
          <div className={`admin-video-thumbnail ${video.orientation === "portrait" ? "is-portrait" : ""}`}>
            {video.thumbnailUrl ? (
              <Image src={video.thumbnailUrl} alt="" fill sizes="96px" className="object-cover" />
            ) : <span>Chưa có ảnh</span>}
          </div>
          <div className="admin-table-title">
            <strong>{video.title}</strong>
            <span>{video.description ?? video.topic}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Nguồn",
      key: "source",
      width: 150,
      render: (_, video) => (
        <div className="admin-table-title">
          <strong>{video.platform === "internal" ? "Mux" : video.platform}</strong>
          <span>{video.orientation} · {formatDuration(video.durationSeconds)}</span>
        </div>
      ),
    },
    {
      title: "Xử lý",
      dataIndex: "processingStatus",
      key: "processingStatus",
      width: 145,
      render: (value: AdminVideo["processingStatus"], video) => (
        <Tooltip title={video.processingError ?? undefined}>
          <Tag color={processingColors[value]}>{processingLabels[value]}</Tag>
        </Tooltip>
      ),
    },
    {
      title: "Nội dung",
      dataIndex: "contentStatus",
      key: "contentStatus",
      width: 130,
      render: (value: AdminVideo["contentStatus"]) => (
        <Tag color={value === "published" ? "success" : value === "archived" ? "default" : "gold"}>
          {value === "published" ? "Đã xuất bản" : value === "archived" ? "Đã lưu trữ" : "Bản nháp"}
        </Tag>
      ),
    },
    { title: "Ngày", key: "date", width: 120, render: (_, video) => formatDate(video.publishedAt ?? video.updatedAt) },
    {
      title: "Nổi bật",
      dataIndex: "featured",
      key: "featured",
      width: 90,
      align: "center",
      render: (featured: boolean, video) => (
        <Switch
          size="small"
          checked={featured}
          disabled={pending || !canWrite || (video.contentStatus === "published" && !canPublish)}
          aria-label={`${featured ? "Bỏ" : "Đặt"} video ${video.title} nổi bật`}
          onChange={(checked) => runAction(() => setVideoFeaturedAction(video.id, checked))}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 210,
      render: (_, video) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              disabled={!canWrite || (video.contentStatus === "published" && !canPublish)}
              aria-label={`Chỉnh sửa ${video.title}`}
              icon={<Pencil size={16} aria-hidden="true" />}
              onClick={() => { setEditing(video); setEditorOpen(true); }}
            />
          </Tooltip>
          {canPublish ? (
            <Tooltip title={video.contentStatus === "published" ? "Gỡ xuất bản" : "Xuất bản"}>
              <Button
                type="text"
                disabled={pending || (video.contentStatus !== "published" && video.processingStatus !== "ready")}
                aria-label={`${video.contentStatus === "published" ? "Gỡ xuất bản" : "Xuất bản"} ${video.title}`}
                icon={video.contentStatus === "published"
                  ? <EyeOff size={16} aria-hidden="true" />
                  : <Send size={16} aria-hidden="true" />}
                onClick={() => runAction(() => setVideoPublishedAction(video.id, video.contentStatus !== "published"))}
              />
            </Tooltip>
          ) : null}
          {video.platform === "internal" && video.processingStatus === "failed" ? (
            <Tooltip title="Chọn file để upload lại">
              <label className="ant-btn ant-btn-text ant-btn-icon-only admin-video-retry-button">
                <RefreshCw size={16} aria-hidden="true" />
                <span className="sr-only">Upload lại {video.title}</span>
                <input
                  type="file"
                  accept={allowedVideoMimeTypes.join(",")}
                  disabled={uploadingId !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    void requestAndUpload({
                      title: video.title,
                      description: video.description,
                      orientation: video.orientation,
                      topic: video.topic,
                      thumbnailMediaId: video.thumbnailMediaId,
                      featured: video.featured,
                      originalFilename: file.name,
                      mimeType: file.type,
                      sizeBytes: file.size,
                      retryVideoId: video.id,
                    }, file, video.id);
                  }}
                />
              </label>
            </Tooltip>
          ) : null}
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              disabled={!canWrite || (video.contentStatus === "published" && !canPublish)}
              aria-label={`Xóa ${video.title}`}
              icon={<Trash2 size={16} aria-hidden="true" />}
              onClick={() => remove(video)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const submitEditor = (input: VideoMutationInput): Promise<ActionFieldErrors | undefined> =>
    new Promise((resolve) => {
      startTransition(async () => {
        const result = editing
          ? await updateVideoAction(editing.id, input)
          : await createExternalVideoAction(input);
        if (!result.success) {
          void message.error(result.message);
          resolve(result.fieldErrors);
          return;
        }
        void message.success(result.message);
        setEditorOpen(false);
        setEditing(null);
        await reload();
        router.refresh();
        resolve(undefined);
      });
    });

  return (
    <>
      <AdminPageHeader
        title="Video"
        description="Upload trực tiếp lên Mux, theo dõi xử lý và quản lý video public từ PostgreSQL."
        action={canWrite ? (
          <Button type="primary" icon={<Plus size={17} aria-hidden="true" />} onClick={() => { setEditing(null); setEditorOpen(true); }}>
            Thêm video ngoài
          </Button>
        ) : undefined}
      />
      {canWrite ? (
        <AdminVideoUploadPanel
          mediaOptions={mediaOptions}
          disabled={uploadingId !== null}
          progress={uploadingId === "new" ? progress : null}
          onUpload={(input, file) => requestAndUpload(input, file, "new")}
        />
      ) : null}
      <section className="admin-panel admin-table-panel" aria-label="Danh sách video">
        <Flex className="admin-table-toolbar" gap={12} wrap>
          <Input
            allowClear
            prefix={<Search size={17} aria-hidden="true" />}
            placeholder="Tìm tiêu đề, mô tả, chủ đề hoặc nền tảng..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Tìm kiếm video"
          />
          <Select
            value={status}
            onChange={setStatus}
            aria-label="Lọc video theo trạng thái"
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "uploading", label: "Đang upload" },
              { value: "processing", label: "Đang xử lý" },
              { value: "ready", label: "Sẵn sàng" },
              { value: "failed", label: "Thất bại" },
              { value: "draft", label: "Bản nháp" },
              { value: "published", label: "Đã xuất bản" },
            ]}
          />
        </Flex>
        <Table<AdminVideo>
          rowKey="id"
          columns={columns}
          dataSource={[...data.items]}
          loading={pending || loading}
          scroll={{ x: 1280 }}
          pagination={{
            ...adminTablePaginationDefaults,
            current: data.page,
            pageSize: data.pageSize,
            total: data.total,
          }}
          onChange={(pagination) => void load({
            page: pagination.current ?? 1,
            pageSize: pagination.pageSize ?? data.pageSize,
            query,
            status,
            sortBy: data.sortBy,
            sortOrder: data.sortOrder,
          })}
          locale={{ emptyText: "Không có video phù hợp." }}
        />
      </section>
      <AdminVideoEditorModal
        open={editorOpen}
        video={editing}
        mediaOptions={mediaOptions}
        pending={pending}
        onCancel={() => { setEditorOpen(false); setEditing(null); }}
        onSubmit={submitEditor}
      />
    </>
  );
}
