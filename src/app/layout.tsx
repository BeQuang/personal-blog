import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { Suspense } from "react";

import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { NavigationProgressProvider } from "@/components/providers/NavigationProgressProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { RouteChrome } from "@/components/layout/RouteChrome";
import { themeStorageKey } from "@/config/theme.config";
import { getEnabledSocialLinks } from "@/services/social.service";
import { getSiteSettings } from "@/server/services/settings.service";

import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
  metadataBase: new URL(settings.siteUrl),
  title: {
    default: settings.defaultSeoTitle ?? settings.siteName,
    template: `%s | ${settings.siteName}`,
  },
  description: settings.defaultSeoDescription ?? settings.siteDescription,
  authors: [{ name: settings.creatorName }],
  creator: settings.creatorName,
  publisher: settings.siteName,
  applicationName: settings.siteName,
  keywords: [
    "Quang Official",
    "sáng tạo nội dung",
    "công nghệ",
    "đời sống",
    "blog cá nhân",
  ],
  category: "Personal blog",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: settings.siteName,
    title: settings.defaultSeoTitle ?? settings.siteName,
    description: settings.defaultSeoDescription ?? settings.siteDescription,
    images: settings.coverImage ? [
      {
        url: settings.coverImage,
        alt: `Ảnh giới thiệu ${settings.creatorName}`,
      },
    ] : [],
  },
  twitter: {
    card: "summary_large_image",
    title: settings.defaultSeoTitle ?? settings.siteName,
    description: settings.defaultSeoDescription ?? settings.siteDescription,
    creator: settings.username,
    images: settings.coverImage ? [settings.coverImage] : [],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  };
}

function createThemeInitializationScript(defaultMode: "light" | "dark" | "system") {
return `
  (() => {
    try {
      const storedTheme = localStorage.getItem(${JSON.stringify(themeStorageKey)});
      const preference = ["light", "dark", "system"].includes(storedTheme)
        ? storedTheme
        : ${JSON.stringify(defaultMode)};
      const resolvedTheme = preference === "system"
        ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : preference;
      const root = document.documentElement;
      root.dataset.theme = resolvedTheme;
      root.dataset.themePreference = preference;
      root.style.colorScheme = resolvedTheme;
    } catch {
      document.documentElement.dataset.theme = ${JSON.stringify(defaultMode === "light" ? "light" : "dark")};
    }
  })();
`;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [socialLinks, settings] = await Promise.all([getEnabledSocialLinks(), getSiteSettings()]);
  const themeInitializationScript = createThemeInitializationScript(settings.theme.mode);

  return (
    <html
      lang="vi"
      className={beVietnamPro.variable}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body>
        <ThemeProvider defaultTheme={settings.theme.mode}>
          <Suspense fallback={null}>
            <NavigationProgressProvider />
          </Suspense>
          <AnalyticsProvider />
          <a href="#main-content" className="skip-link">
            Chuyển đến nội dung chính
          </a>
          <RouteChrome
            header={<Header socialLinks={socialLinks} settings={settings} />}
            footer={<Footer socialLinks={socialLinks} settings={settings} />}
          >
            {children}
          </RouteChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
