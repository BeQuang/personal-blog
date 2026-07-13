import type { NavigationItem } from "@/types";

export const mainNavigation = [
  { label: "Trang chủ", href: "/" },
  { label: "Bài viết", href: "/blog" },
  { label: "Video", href: "/videos" },
  { label: "Hình ảnh", href: "/gallery" },
  { label: "Sự kiện", href: "/events" },
  { label: "Giới thiệu", href: "/about" },
] as const satisfies readonly NavigationItem[];

export const footerNavigation = [
  ...mainNavigation,
  { label: "Liên hệ", href: "/contact" },
] as const satisfies readonly NavigationItem[];

export const legalNavigation = [
  { label: "Chính sách quyền riêng tư", href: "/privacy" },
  { label: "Điều khoản sử dụng", href: "/terms" },
] as const satisfies readonly NavigationItem[];
