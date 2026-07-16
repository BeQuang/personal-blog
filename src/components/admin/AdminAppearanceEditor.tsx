"use client";

import { App, Button, Card, Divider, Segmented, Select, Switch } from "antd";
import { RotateCcw, Save } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  adminAppearanceStorageKey,
  defaultAdminAppearance,
  homepageSectionLabels,
} from "@/config/admin.config";
import type {
  AdminAppearanceSettings,
  ButtonStyle,
  CardStyle,
  HomepageSectionKey,
} from "@/types";

const sectionKeys = Object.keys(homepageSectionLabels) as HomepageSectionKey[];
const cardStyles: CardStyle[] = ["solid", "bordered", "glass", "minimal"];
const buttonStyles: ButtonStyle[] = ["solid", "gradient", "outline", "pill"];

function readStoredAppearance(rawValue: string | null): AdminAppearanceSettings | null {
  if (!rawValue) return null;

  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== "object") return null;
    const value = parsed as Record<string, unknown>;
    if (
      (value.mode !== "light" && value.mode !== "dark") ||
      typeof value.primaryColor !== "string" ||
      typeof value.secondaryColor !== "string" ||
      !cardStyles.includes(value.cardStyle as CardStyle) ||
      !buttonStyles.includes(value.buttonStyle as ButtonStyle) ||
      (value.layout !== "creator" && value.layout !== "minimal") ||
      !value.sections ||
      typeof value.sections !== "object"
    ) {
      return null;
    }

    const storedSections = value.sections as Record<string, unknown>;
    const sections = { ...defaultAdminAppearance.sections };
    sectionKeys.forEach((key) => {
      if (typeof storedSections[key] === "boolean") {
        sections[key] = storedSections[key];
      }
    });

    return {
      mode: value.mode,
      primaryColor: value.primaryColor,
      secondaryColor: value.secondaryColor,
      cardStyle: value.cardStyle as CardStyle,
      buttonStyle: value.buttonStyle as ButtonStyle,
      layout: value.layout,
      sections,
    };
  } catch {
    return null;
  }
}

function subscribeToAppearanceStorage(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === adminAppearanceStorageKey) onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

function getAppearanceSnapshot() {
  return localStorage.getItem(adminAppearanceStorageKey);
}

function getServerAppearanceSnapshot() {
  return null;
}

export function AdminAppearanceEditor() {
  const { message } = App.useApp();
  const storedValue = useSyncExternalStore(
    subscribeToAppearanceStorage,
    getAppearanceSnapshot,
    getServerAppearanceSnapshot,
  );
  const storedSettings = useMemo(
    () => readStoredAppearance(storedValue),
    [storedValue],
  );
  const [draftSettings, setDraftSettings] = useState<AdminAppearanceSettings | null>(null);
  const settings = draftSettings ?? storedSettings ?? defaultAdminAppearance;

  const updateSetting = <Key extends keyof AdminAppearanceSettings>(
    key: Key,
    value: AdminAppearanceSettings[Key],
  ) => setDraftSettings((current) => ({ ...(current ?? settings), [key]: value }));

  const save = () => {
    localStorage.setItem(adminAppearanceStorageKey, JSON.stringify(settings));
    void message.success("Đã lưu cấu hình Appearance demo trên trình duyệt này.");
  };

  const reset = () => {
    localStorage.removeItem(adminAppearanceStorageKey);
    setDraftSettings(defaultAdminAppearance);
    void message.success("Đã khôi phục cấu hình mặc định.");
  };

  const previewStyle = {
    "--admin-preview-primary": settings.primaryColor,
    "--admin-preview-secondary": settings.secondaryColor,
  } as React.CSSProperties;

  return (
    <>
      <AdminPageHeader
        title="Giao diện"
        description="Thử cấu hình phong cách trong vùng preview. Thay đổi không tác động đến website public."
        action={
          <div className="admin-heading-actions">
            <Button icon={<RotateCcw aria-hidden="true" size={16} />} onClick={reset}>Đặt lại</Button>
            <Button type="primary" icon={<Save aria-hidden="true" size={16} />} onClick={save}>Lưu demo</Button>
          </div>
        }
      />

      <div className="admin-appearance-grid">
        <Card title="Cấu hình" className="admin-settings-card">
          <div className="admin-control-group">
            <label>Chế độ màu</label>
            <Segmented
              block
              aria-label="Chế độ màu của bản xem trước"
              value={settings.mode}
              options={[{ label: "Sáng", value: "light" }, { label: "Tối", value: "dark" }]}
              onChange={(value) => updateSetting("mode", value === "dark" ? "dark" : "light")}
            />
          </div>
          <div className="admin-color-grid">
            <label>
              <span>Màu chính</span>
              <span className="admin-color-control">
                <input type="color" value={settings.primaryColor} onChange={(event) => updateSetting("primaryColor", event.target.value)} />
                <code>{settings.primaryColor}</code>
              </span>
            </label>
            <label>
              <span>Màu phụ</span>
              <span className="admin-color-control">
                <input type="color" value={settings.secondaryColor} onChange={(event) => updateSetting("secondaryColor", event.target.value)} />
                <code>{settings.secondaryColor}</code>
              </span>
            </label>
          </div>
          <div className="admin-control-grid">
            <div className="admin-control-group">
              <label htmlFor="card-style">Kiểu card</label>
              <Select id="card-style" value={settings.cardStyle} onChange={(value: CardStyle) => updateSetting("cardStyle", value)} options={cardStyles.map((value) => ({ value, label: value }))} />
            </div>
            <div className="admin-control-group">
              <label htmlFor="button-style">Kiểu button</label>
              <Select id="button-style" value={settings.buttonStyle} onChange={(value: ButtonStyle) => updateSetting("buttonStyle", value)} options={buttonStyles.map((value) => ({ value, label: value }))} />
            </div>
          </div>
          <div className="admin-control-group">
            <label>Layout</label>
            <Segmented aria-label="Kiểu layout của bản xem trước" block value={settings.layout} options={[{ label: "Creator", value: "creator" }, { label: "Minimal", value: "minimal" }]} onChange={(value) => updateSetting("layout", value === "minimal" ? "minimal" : "creator")} />
          </div>
          <Divider titlePlacement="start">Section trang chủ</Divider>
          <div className="admin-section-switches">
            {sectionKeys.map((key) => (
              <label key={key}>
                <span>{homepageSectionLabels[key]}</span>
                <Switch aria-label={`Bật hoặc tắt section ${homepageSectionLabels[key]}`} checked={settings.sections[key]} onChange={(checked) => updateSetting("sections", { ...settings.sections, [key]: checked })} />
              </label>
            ))}
          </div>
        </Card>

        <Card title="Preview cơ bản" extra="Chỉ trong Admin" className="admin-settings-card admin-preview-card">
          <div className={`admin-appearance-preview is-${settings.mode} card-${settings.cardStyle} button-${settings.buttonStyle} layout-${settings.layout}`} style={previewStyle}>
            <span className="admin-preview-pill">Creator journal</span>
            <h2>Chia sẻ câu chuyện theo cách của bạn.</h2>
            <p>Một bản xem trước nhỏ giúp kiểm tra màu sắc, card, button và nhịp layout.</p>
            <button type="button">Khám phá nội dung</button>
            <div className="admin-preview-mini-grid">
              <article><small>BÀI VIẾT</small><strong>Ý tưởng mới mỗi tuần</strong></article>
              <article><small>VIDEO</small><strong>Hậu trường sáng tạo</strong></article>
            </div>
          </div>
          <p className="admin-preview-note">{sectionKeys.filter((key) => settings.sections[key]).length}/{sectionKeys.length} section đang bật.</p>
        </Card>
      </div>
    </>
  );
}
