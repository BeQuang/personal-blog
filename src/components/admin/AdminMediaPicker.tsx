"use client";

import { Button, Empty, Input, Modal } from "antd";
import { Images, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

export interface AdminMediaPickerOption {
  id: string;
  label: string;
  publicUrl: string;
}

interface AdminMediaPickerProps {
  items: readonly AdminMediaPickerOption[];
  value?: string;
  label: string;
  onChange: (value: { id: string; publicUrl: string } | null) => void;
}

export function AdminMediaPicker({ items, value, label, onChange }: AdminMediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = items.find((item) => item.id === value);
  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi-VN");
    return normalized
      ? items.filter((item) => item.label.toLocaleLowerCase("vi-VN").includes(normalized))
      : items;
  }, [items, query]);

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
        <Button icon={<Images size={16} aria-hidden="true" />} onClick={() => setOpen(true)}>
          Chọn {label.toLocaleLowerCase("vi-VN")}
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

      <Modal
        title={`Chọn ${label.toLocaleLowerCase("vi-VN")} từ Media Library`}
        open={open}
        footer={null}
        width={860}
        onCancel={() => setOpen(false)}
        destroyOnHidden
      >
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
      </Modal>
    </div>
  );
}
