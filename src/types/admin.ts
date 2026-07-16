import type {
  ButtonStyle,
  CardStyle,
  HomepageSectionKey,
  LayoutStyle,
  ThemeMode,
} from "@/types/site";

export type AdminResource =
  | "posts"
  | "social-links"
  | "videos"
  | "gallery"
  | "events"
  | "campaigns";

export interface AdminTableRow {
  id: string;
  title: string;
  detail?: string;
  group?: string;
  status?: string;
  date?: string;
  featured?: boolean;
  enabled?: boolean;
}

export interface AdminAppearanceSettings {
  mode: Exclude<ThemeMode, "system">;
  primaryColor: string;
  secondaryColor: string;
  cardStyle: CardStyle;
  buttonStyle: ButtonStyle;
  layout: Extract<LayoutStyle, "creator" | "minimal">;
  sections: Record<HomepageSectionKey, boolean>;
}

export interface AdminSiteSettings {
  siteName: string;
  siteDescription: string;
  email: string;
  avatarUrl: string;
  coverUrl: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
}
