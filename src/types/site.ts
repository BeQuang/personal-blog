export type ThemeMode = "light" | "dark" | "system";

export type LayoutStyle = "creator" | "minimal" | "magazine";

export type CardStyle = "solid" | "bordered" | "glass" | "minimal";

export type ButtonStyle = "solid" | "gradient" | "outline" | "pill";

export type HomepageSectionKey =
  | "hero"
  | "socialLinks"
  | "featuredContent"
  | "latestPosts"
  | "latestVideos"
  | "gallery"
  | "events"
  | "campaign"
  | "newsletter"
  | "collaboration";

export interface NavigationItem {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
}

export interface ThemeSettings {
  mode: ThemeMode;
  layout: LayoutStyle;
  cardStyle: CardStyle;
  buttonStyle: ButtonStyle;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  borderRadius: number;
}

export interface SiteConfig {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  locale: string;
  logo?: string;
  avatar?: string;
  coverImage?: string;
  creatorName: string;
  username: string;
  contactEmail: string;
  theme: ThemeSettings;
  navigation: readonly NavigationItem[];
  homepageSections: Record<HomepageSectionKey, boolean>;
}

export interface CreatorStatistic {
  label: string;
  value: string;
}

export interface HomepageConfig {
  hero: {
    eyebrow: string;
    description: string;
    topics: readonly string[];
    statistics: readonly CreatorStatistic[];
  };
  socialLinks: {
    eyebrow: string;
    title: string;
    description: string;
  };
  featuredContent: {
    eyebrow: string;
    title: string;
  };
  latestPosts: {
    eyebrow: string;
    title: string;
    description: string;
  };
  latestVideos: {
    eyebrow: string;
    title: string;
    description: string;
  };
  gallery: {
    eyebrow: string;
    title: string;
    description: string;
  };
  events: {
    eyebrow: string;
    title: string;
    description: string;
  };
  campaign: {
    eyebrow: string;
    title: string;
  };
  newsletter: {
    eyebrow: string;
    title: string;
    description: string;
    privacyNote: string;
  };
  collaboration: {
    eyebrow: string;
    title: string;
    description: string;
  };
}
