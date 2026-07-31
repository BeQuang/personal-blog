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
import viVN from "antd/locale/vi_VN";
import {
  CalendarDays,
  FileText,
  GalleryHorizontalEnd,
  Gauge,
  ImageIcon,
  Inbox,
  Link2,
  LogOut,
  MenuIcon,
  MonitorCog,
  Settings,
  Video,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { logoutAction } from "@/actions/auth.actions";
import { adminNavigation } from "@/config/admin.config";
import { startNavigationProgress } from "@/lib/loading-progress";
import {
  hasPermission,
  type Permission,
  type UserRole,
} from "@/server/auth/permissions";
import { cn } from "@/utils/cn";

const { Header, Sider, Content } = Layout;

const navigationIcons = {
  overview: Gauge,
  posts: FileText,
  "social-links": Link2,
  videos: Video,
  gallery: ImageIcon,
  events: CalendarDays,
  campaigns: GalleryHorizontalEnd,
  submissions: Inbox,
  appearance: MonitorCog,
  settings: Settings,
} as const;

const navigationPermissions = {
  overview: "analytics:view",
  posts: "content:view",
  "social-links": "settings:manage",
  videos: "media:manage",
  gallery: "media:manage",
  events: "content:view",
  campaigns: "content:view",
  submissions: "submissions:view",
  appearance: "settings:manage",
  settings: "settings:manage",
} as const satisfies Record<
  (typeof adminNavigation)[number]["key"],
  Permission
>;

const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

function AdminMenu({
  selectedKey,
  onNavigate,
  role,
}: {
  selectedKey: string;
  onNavigate: (href: string) => void;
  role: UserRole;
}) {
  const menuItems: MenuProps["items"] = adminNavigation
    .filter((item) => hasPermission(role, navigationPermissions[item.key]))
    .map((item) => {
      const Icon = navigationIcons[item.key];
      return {
        key: item.href,
        icon: <Icon aria-hidden="true" size={18} />,
        label: item.label,
      };
    });

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

function AdminLogoutButton() {
  const { modal } = AntdApp.useApp();
  const logoutFormRef = useRef<HTMLFormElement>(null);

  const confirmLogout = () => {
    modal.confirm({
      title: "Xác nhận đăng xuất",
      content:
        "Bạn có chắc muốn đăng xuất khỏi khu vực quản trị? Bạn sẽ cần đăng nhập lại để tiếp tục.",
      okText: "Đăng xuất",
      cancelText: "Ở lại",
      okButtonProps: { danger: true },
      focusable: { autoFocusButton: "cancel" },
      onOk: () => logoutFormRef.current?.requestSubmit(),
    });
  };

  return (
    <form ref={logoutFormRef} action={logoutAction}>
      <Button
        htmlType="button"
        type="text"
        icon={<LogOut aria-hidden="true" size={18} />}
        aria-label="Đăng xuất"
        onClick={confirmLogout}
      />
    </form>
  );
}

export function AdminShell({
  children,
  currentUser,
}: {
  children: React.ReactNode;
  currentUser: {
    displayName: string;
    email: string | null;
    role: UserRole;
  };
}) {
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
    if (href === pathname) return;
    startNavigationProgress();
    router.push(href);
  };

  return (
    <ConfigProvider
      locale={viVN}
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
            <AdminMenu
              selectedKey={selectedItem.href}
              onNavigate={navigate}
              role={currentUser.role}
            />
            <div className="admin-demo-note">
              <Tag color="gold">MVP</Tag>
              <p>Khu vực quản trị có phân quyền; một số tích hợp ngoài phạm vi vẫn là bản MVP.</p>
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
            <AdminMenu
              selectedKey={selectedItem.href}
              onNavigate={navigate}
              role={currentUser.role}
            />
            <div className="admin-demo-note">
              <Tag color="gold">MVP</Tag>
              <p>Khu vực quản trị có phân quyền; một số tích hợp ngoài phạm vi vẫn là bản MVP.</p>
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
              <div className="admin-header-context">
                <span className="admin-header-eyebrow">Khu vực quản trị</span>
                <Breadcrumb
                  className="admin-header-breadcrumb"
                  items={[
                    { title: "Admin", href: "/admin" },
                    ...(selectedItem.href === "/admin"
                      ? []
                      : [{ title: selectedItem.label }]),
                  ]}
                />
              </div>
              <Tag color="purple" className="admin-header-tag">
                Admin MVP
              </Tag>
              <div className="admin-user-summary">
                <span>{currentUser.displayName}</span>
                <small>{roleLabels[currentUser.role]}</small>
              </div>
              <AdminLogoutButton />
            </Header>
            <Content
              className={cn(
                "admin-content",
                (
                  pathname.startsWith("/admin/posts") ||
                  pathname.startsWith("/admin/social-links") ||
                  pathname.startsWith("/admin/gallery")
                ) &&
                  "admin-content-viewport",
              )}
            >
              {children}
            </Content>
          </Layout>
        </Layout>
      </AntdApp>
    </ConfigProvider>
  );
}
