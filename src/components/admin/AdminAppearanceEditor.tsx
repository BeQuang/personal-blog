"use client";

import { App, Button, Card, Divider, InputNumber, Segmented, Select, Switch } from "antd";
import { Save } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateSiteSettingsAction } from "@/actions/settings.actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { homepageSectionLabels } from "@/config/admin.config";
import type { ButtonStyle, CardStyle, HomepageSectionKey, SiteSettingsMutationInput, ThemeSettings } from "@/types";

const sectionKeys = Object.keys(homepageSectionLabels) as HomepageSectionKey[];
const cardStyles: CardStyle[] = ["solid", "bordered", "glass", "minimal"];
const buttonStyles: ButtonStyle[] = ["solid", "gradient", "outline", "pill"];

export function AdminAppearanceEditor({ initialSettings }: { initialSettings: SiteSettingsMutationInput }) {
  const { message } = App.useApp(); const router = useRouter(); const [settings, setSettings] = useState(initialSettings); const [pending, startTransition] = useTransition();
  const updateTheme = <Key extends keyof ThemeSettings>(key: Key, value: ThemeSettings[Key]) => setSettings((current) => ({ ...current, theme: { ...current.theme, [key]: value } }));
  const save = () => startTransition(async () => { const result = await updateSiteSettingsAction(settings); if (!result.success) { void message.error(result.message); return; } void message.success(result.message); router.refresh(); });
  const previewStyle = { "--admin-preview-primary": settings.theme.primaryColor, "--admin-preview-secondary": settings.theme.secondaryColor } as React.CSSProperties;
  return <>
    <AdminPageHeader title="Giao diện" description="Theme và trạng thái các section trang chủ được lưu vào Site Settings." action={<Button type="primary" loading={pending} icon={<Save size={16} />} onClick={save}>Lưu giao diện</Button>} />
    <div className="admin-appearance-grid">
      <Card title="Cấu hình" className="admin-settings-card">
        <div className="admin-control-group"><label>Chế độ màu</label><Segmented block value={settings.theme.mode} options={[{ label: "Sáng", value: "light" }, { label: "Tối", value: "dark" }, { label: "Hệ thống", value: "system" }]} onChange={(value) => updateTheme("mode", value === "dark" ? "dark" : value === "system" ? "system" : "light")} /></div>
        <div className="admin-color-grid">{(["primaryColor", "secondaryColor", "accentColor"] as const).map((key) => <label key={key}><span>{key}</span><span className="admin-color-control"><input aria-label={key} type="color" value={settings.theme[key]} onChange={(event) => updateTheme(key, event.target.value)} /><code>{settings.theme[key]}</code></span></label>)}</div>
        <div className="admin-control-grid"><div className="admin-control-group"><label>Kiểu card</label><Select value={settings.theme.cardStyle} onChange={(value: CardStyle) => updateTheme("cardStyle", value)} options={cardStyles.map((value) => ({ value, label: value }))} /></div><div className="admin-control-group"><label>Kiểu button</label><Select value={settings.theme.buttonStyle} onChange={(value: ButtonStyle) => updateTheme("buttonStyle", value)} options={buttonStyles.map((value) => ({ value, label: value }))} /></div></div>
        <div className="admin-control-grid"><div className="admin-control-group"><label>Layout</label><Select value={settings.theme.layout} onChange={(value: ThemeSettings["layout"]) => updateTheme("layout", value)} options={["creator", "minimal", "magazine"].map((value) => ({ value, label: value }))} /></div><div className="admin-control-group"><label>Bo góc</label><InputNumber min={0} max={32} value={settings.theme.borderRadius} onChange={(value) => updateTheme("borderRadius", value ?? 0)} /></div></div>
        <Divider titlePlacement="start">Section trang chủ</Divider><div className="admin-section-switches">{sectionKeys.map((key) => <label key={key}><span>{homepageSectionLabels[key]}</span><Switch checked={settings.homepageSections[key]} aria-label={`Bật hoặc tắt ${homepageSectionLabels[key]}`} onChange={(checked) => setSettings((current) => ({ ...current, homepageSections: { ...current.homepageSections, [key]: checked } }))} /></label>)}</div>
      </Card>
      <Card title="Preview cơ bản" className="admin-settings-card admin-preview-card"><div className={`admin-appearance-preview is-${settings.theme.mode === "system" ? "light" : settings.theme.mode} card-${settings.theme.cardStyle} button-${settings.theme.buttonStyle} layout-${settings.theme.layout}`} style={previewStyle}><span className="admin-preview-pill">Creator journal</span><h2>{settings.siteName}</h2><p>{settings.siteDescription}</p><button type="button">Khám phá nội dung</button></div><p className="admin-preview-note">{sectionKeys.filter((key) => settings.homepageSections[key]).length}/{sectionKeys.length} section đang bật.</p></Card>
    </div>
  </>;
}
