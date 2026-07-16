import type {
  AdminAppearanceSettings,
  AdminResource,
  HomepageSectionKey,
} from "@/types";
import { defaultTheme } from "@/config/theme.config";
import { siteConfig } from "@/config/site.config";

export const adminAppearanceStorageKey = "creator-blog-admin-appearance";

export const adminNavigation = [
  { key: "overview", label: "Tổng quan", href: "/admin" },
  { key: "posts", label: "Bài viết", href: "/admin/posts" },
  { key: "social-links", label: "Mạng xã hội", href: "/admin/social-links" },
  { key: "videos", label: "Video", href: "/admin/videos" },
  { key: "gallery", label: "Hình ảnh", href: "/admin/gallery" },
  { key: "events", label: "Sự kiện", href: "/admin/events" },
  { key: "campaigns", label: "Chiến dịch", href: "/admin/campaigns" },
  { key: "appearance", label: "Giao diện", href: "/admin/appearance" },
  { key: "settings", label: "Cài đặt", href: "/admin/settings" },
] as const;

export const adminResourceLabels: Record<AdminResource, string> = {
  posts: "Bài viết",
  "social-links": "Mạng xã hội",
  videos: "Video",
  gallery: "Hình ảnh",
  events: "Sự kiện",
  campaigns: "Chiến dịch",
};

export const homepageSectionLabels: Record<HomepageSectionKey, string> = {
  hero: "Hero",
  socialLinks: "Mạng xã hội",
  featuredContent: "Nội dung nổi bật",
  latestPosts: "Bài viết mới",
  latestVideos: "Video mới",
  gallery: "Thư viện ảnh",
  events: "Sự kiện",
  campaign: "Chiến dịch",
  newsletter: "Newsletter",
  collaboration: "Hợp tác",
};

export const defaultAdminAppearance: AdminAppearanceSettings = {
  mode: defaultTheme.mode === "light" ? "light" : "dark",
  primaryColor: defaultTheme.primaryColor,
  secondaryColor: defaultTheme.secondaryColor,
  cardStyle: defaultTheme.cardStyle,
  buttonStyle: defaultTheme.buttonStyle,
  layout: defaultTheme.layout === "minimal" ? "minimal" : "creator",
  sections: { ...siteConfig.homepageSections },
};

export const adminMockMetrics = {
  totalVisits: 128_420,
  socialClicks: 34_890,
} as const;
