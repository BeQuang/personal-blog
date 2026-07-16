import type { AdminResource, AdminTableRow } from "@/types";

export const adminStatusColors: Record<string, string> = {
  published: "green",
  active: "green",
  live: "red",
  upcoming: "blue",
  scheduled: "cyan",
  draft: "default",
  ended: "default",
  cancelled: "volcano",
};

export const adminStatusLabels: Record<string, string> = {
  published: "Đã xuất bản",
  active: "Đang chạy",
  live: "Đang diễn ra",
  upcoming: "Sắp diễn ra",
  scheduled: "Đã lên lịch",
  draft: "Bản nháp",
  ended: "Đã kết thúc",
  cancelled: "Đã hủy",
};

export function formatAdminDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

export function createAdminDemoRow(
  resource: AdminResource,
  title: string,
): AdminTableRow {
  const common = {
    id: `demo-${resource}-${Date.now()}`,
    title,
    detail: "Nội dung vừa tạo trong phiên hiện tại",
  };

  switch (resource) {
    case "social-links":
      return {
        ...common,
        group: "Demo",
        enabled: true,
      };
    case "events":
      return {
        ...common,
        group: "offline",
        status: "upcoming",
        date: new Date().toISOString(),
        featured: false,
        enabled: true,
      };
    case "campaigns":
      return {
        ...common,
        group: "Marketing",
        status: "draft",
        date: new Date().toISOString(),
        featured: false,
        enabled: false,
      };
    case "videos":
      return {
        ...common,
        group: "Demo · landscape",
        status: "draft",
        date: new Date().toISOString(),
        featured: false,
        enabled: false,
      };
    case "gallery":
      return {
        ...common,
        group: "Chưa phân loại",
        status: "draft",
        date: new Date().toISOString(),
        enabled: false,
      };
    case "posts":
      return {
        ...common,
        group: "Chưa phân loại",
        status: "draft",
        date: new Date().toISOString(),
        featured: false,
        enabled: false,
      };
  }
}
