import { mainNavigation } from "@/config/navigation.config";
import { defaultTheme } from "@/config/theme.config";
import type { SiteConfig } from "@/types";

export const siteConfig = {
  siteName: "Quang Official",
  siteDescription:
    "Nơi tổng hợp bài viết, video, hình ảnh và các hoạt động mới nhất của Quang.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "vi-VN",
  logo: "/images/logo.svg",
  avatar: "/images/avatar/quang-avatar.jpg",
  coverImage: "/images/avatar/quang-cover.jpg",
  creatorName: "Quang",
  username: "@quangofficial",
  contactEmail: "hello@quangofficial.vn",
  theme: defaultTheme,
  navigation: mainNavigation,
  homepageSections: {
    hero: true,
    socialLinks: true,
    featuredContent: true,
    latestPosts: true,
    latestVideos: true,
    gallery: true,
    events: true,
    campaign: true,
    newsletter: true,
    collaboration: true,
  },
} satisfies SiteConfig;
