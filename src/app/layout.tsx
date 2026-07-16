import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { RouteChrome } from "@/components/layout/RouteChrome";
import { siteConfig } from "@/config/site.config";
import { themeStorageKey } from "@/config/theme.config";

import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.siteName,
    template: `%s | ${siteConfig.siteName}`,
  },
  description: siteConfig.siteDescription,
  authors: [{ name: siteConfig.creatorName }],
  creator: siteConfig.creatorName,
  publisher: siteConfig.siteName,
  applicationName: siteConfig.siteName,
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
    siteName: siteConfig.siteName,
    title: siteConfig.siteName,
    description: siteConfig.siteDescription,
    images: [
      {
        url: siteConfig.coverImage,
        alt: `Ảnh giới thiệu ${siteConfig.creatorName}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.siteName,
    description: siteConfig.siteDescription,
    creator: siteConfig.username,
    images: [siteConfig.coverImage],
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

const themeInitializationScript = `
  (() => {
    try {
      const storedTheme = localStorage.getItem(${JSON.stringify(themeStorageKey)});
      const preference = ["light", "dark", "system"].includes(storedTheme)
        ? storedTheme
        : ${JSON.stringify(siteConfig.theme.mode)};
      const resolvedTheme = preference === "system"
        ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : preference;
      const root = document.documentElement;
      root.dataset.theme = resolvedTheme;
      root.dataset.themePreference = preference;
      root.style.colorScheme = resolvedTheme;
    } catch {
      document.documentElement.dataset.theme = ${JSON.stringify(siteConfig.theme.mode === "light" ? "light" : "dark")};
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <ThemeProvider defaultTheme={siteConfig.theme.mode}>
          <a href="#main-content" className="skip-link">
            Chuyển đến nội dung chính
          </a>
          <RouteChrome header={<Header />} footer={<Footer />}>
            {children}
          </RouteChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
