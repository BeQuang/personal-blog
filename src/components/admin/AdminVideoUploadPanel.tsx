"use client";

import { Button, Form, Input, Select, Switch } from "antd";
import { Upload } from "lucide-react";
import { useState } from "react";

import { AdminMediaPicker } from "@/components/admin/AdminMediaPicker";
import type { CreateVideoUploadInput, MediaOption } from "@/types";

interface UploadFormValues {
  title: string;
  description?: string;
  orientation: "landscape" | "portrait";
  topic: string;
  thumbnailMediaId?: string;
  featured: boolean;
}

interface AdminVideoUploadPanelProps {
  mediaOptions: readonly MediaOption[];
  disabled: boolean;
  progress: number | null;
  onUpload: (input: CreateVideoUploadInput, file: File) => Promise<boolean>;
}

export const allowedVideoMimeTypes = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-matroska",
] as const;
export const maximumVideoSizeBytes = 5 * 1024 * 1024 * 1024;

export function AdminVideoUploadPanel({
  mediaOptions,
  disabled,
  progress,
  onUpload,
}: AdminVideoUploadPanelProps) {
  const [form] = Form.useForm<UploadFormValues>();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const thumbnailMediaId = Form.useWatch("thumbnailMediaId", form);

  const submit = async (values: UploadFormValues) => {
    if (!file) {
      setFileError("Hãy chọn file video trước khi upload.");
      return;
    }
    const success = await onUpload({
      ...values,
      description: values.description || null,
      thumbnailMediaId: values.thumbnailMediaId ?? null,
      originalFilename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    }, file);
    if (success) {
      form.resetFields();
      setFile(null);
      setFileError(null);
    }
  };

  return (
    <section className="admin-panel admin-video-upload-panel" aria-labelledby="video-upload-title">
      <div className="admin-video-upload-copy">
        <h2 id="video-upload-title">Upload video lên Mux</h2>
        <p>MP4, MOV, WebM hoặc MKV; tối đa 5 GB. File đi thẳng từ trình duyệt tới Mux.</p>
      </div>
      <Form<UploadFormValues>
        form={form}
        layout="vertical"
        disabled={disabled}
        initialValues={{ orientation: "landscape", featured: false }}
        onFinish={(values) => void submit(values)}
      >
        <div className="admin-form-grid">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: "Vui lòng nhập tiêu đề." }]}>
            <Input maxLength={180} showCount />
          </Form.Item>
          <Form.Item name="topic" label="Chủ đề" rules={[{ required: true, message: "Vui lòng nhập chủ đề." }]}>
            <Input maxLength={100} />
          </Form.Item>
        </div>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={2} maxLength={2000} showCount />
        </Form.Item>
        <div className="admin-form-grid">
          <Form.Item name="orientation" label="Hướng video" rules={[{ required: true }]}>
            <Select options={[
              { value: "landscape", label: "Landscape (16:9)" },
              { value: "portrait", label: "Portrait (9:16)" },
            ]} />
          </Form.Item>
          <Form.Item name="featured" label="Nổi bật" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
        <Form.Item label="Thumbnail" extra="Có thể để trống để dùng thumbnail tự động của Mux.">
          <AdminMediaPicker
            items={mediaOptions}
            value={thumbnailMediaId}
            label="Thumbnail"
            purpose="post_thumbnail"
            onChange={(selection) => form.setFieldValue("thumbnailMediaId", selection?.id)}
          />
        </Form.Item>
        <div className="admin-video-file-row">
          <label className="ant-btn ant-btn-default admin-video-file-button">
            <Upload size={16} aria-hidden="true" />
            <span>{file ? file.name : "Chọn video"}</span>
            <input
              type="file"
              accept={allowedVideoMimeTypes.join(",")}
              disabled={disabled}
              aria-describedby={fileError ? "video-file-error" : undefined}
              aria-invalid={fileError ? "true" : undefined}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setFileError(null);
                event.target.value = "";
              }}
            />
          </label>
          <Button type="primary" htmlType="submit" loading={disabled} disabled={!file}>
            {progress === null ? "Bắt đầu upload" : `Đang upload ${progress}%`}
          </Button>
        </div>
        {fileError ? (
          <p id="video-file-error" className="admin-form-error" role="alert">{fileError}</p>
        ) : null}
        {progress !== null ? (
          <div className="admin-video-progress" aria-label={`Tiến độ upload ${progress}%`}>
            <span style={{ width: `${progress}%` }} />
          </div>
        ) : null}
      </Form>
    </section>
  );
}
