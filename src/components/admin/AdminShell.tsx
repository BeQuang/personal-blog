"use client";

import {
  App as AntdApp,
  Breadcrumb,
  Button,
  ConfigProvider,
  Drawer,
  Layout,
  Menu,
  Tag,
  theme,
} from "antd";
import type { MenuProps } from "antd";
import {
  CalendarDays,
  FileText,
  GalleryHorizontalEnd,
  Gauge,
  ImageIcon,
  Link2,
  MenuIcon,
  MonitorCog,
  Settings,
  Video,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { adminNavigation } from "@/config/admin.config";

const { Header, Sider, Content } = Layout;

const navigationIcons = {
  overview: Gauge,
  posts: FileText,
  "social-links": Link2,
  videos: Video,
  gallery: ImageIcon,
  events: CalendarDays,
  campaigns: GalleryHorizontalEnd,
  appearance: MonitorCog,
  settings: Settings,
} as const;

const menuItems: MenuProps["items"] = adminNavigation.map((item) => {
  const Icon = navigationIcons[item.key];
  return {
    key: item.href,
    icon: <Icon aria-hidden="true" size={18} />,
    label: item.label,
  };
});

function AdminMenu({
  selectedKey,
  onNavigate,
}: {
  selectedKey: string;
  onNavigate: (href: string) => void;
}) {
  return (
    <Menu
      mode="inline"
      items={menuItems}
      selectedKeys={[selectedKey]}
      onClick={({ key }) => onNavigate(key)}
      aria-label="Điều hướng quản trị"
    />
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const selectedItem =
    [...adminNavigation]
      .reverse()
      .find((item) =>
        item.href === "/admin"
          ? pathname === item.href
          : pathname.startsWith(item.href),
      ) ?? adminNavigation[0];

  const navigate = (href: string) => {
    setDrawerOpen(false);
    router.push(href);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#7c3aed",
          borderRadius: 10,
          fontFamily: "var(--font-be-vietnam-pro), sans-serif",
        },
        components: {
          Layout: {
            bodyBg: "#f5f7fb",
            headerBg: "#ffffff",
            siderBg: "#ffffff",
          },
          Menu: {
            itemSelectedBg: "#ede9fe",
            itemSelectedColor: "#6d28d9",
          },
        },
      }}
    >
      <AntdApp>
        <Layout className="admin-shell">
          <Sider width={252} className="admin-desktop-sider" theme="light">
            <div className="admin-brand">
              <span className="admin-brand-mark">Q</span>
              <span>
                <strong>Quang Admin</strong>
                <small>Dashboard demo</small>
              </span>
            </div>
            <AdminMenu selectedKey={selectedItem.href} onNavigate={navigate} />
            <div className="admin-demo-note">
              <Tag color="gold">DEMO</Tag>
              <p>Không có xác thực, backend hoặc dữ liệu production.</p>
            </div>
          </Sider>

          <Drawer
            title="Quang Admin"
            placement="left"
            size={292}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            className="admin-mobile-drawer"
          >
            <AdminMenu selectedKey={selectedItem.href} onNavigate={navigate} />
            <div className="admin-demo-note">
              <Tag color="gold">DEMO</Tag>
              <p>Không có xác thực, backend hoặc dữ liệu production.</p>
            </div>
          </Drawer>

          <Layout>
            <Header className="admin-header">
              <Button
                type="text"
                icon={<MenuIcon aria-hidden="true" size={21} />}
                aria-label="Mở menu quản trị"
                className="admin-menu-button"
                onClick={() => setDrawerOpen(true)}
              />
              <div>
                <span className="admin-header-eyebrow">Khu vực quản trị</span>
                <strong>{selectedItem.label}</strong>
              </div>
              <Tag color="purple" className="admin-header-tag">
                Dữ liệu mock
              </Tag>
            </Header>
            <Content className="admin-content">
              <Breadcrumb
                items={[
                  { title: "Admin", href: "/admin" },
                  ...(selectedItem.href === "/admin"
                    ? []
                    : [{ title: selectedItem.label }]),
                ]}
              />
              {children}
            </Content>
          </Layout>
        </Layout>
      </AntdApp>
    </ConfigProvider>
  );
}
