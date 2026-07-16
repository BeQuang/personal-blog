import type { Metadata } from "next";

import { Container } from "@/components/common/Container";
import { GalleryExplorer } from "@/components/gallery/GalleryExplorer";
import { siteConfig } from "@/config/site.config";
import { withSocialMetadata } from "@/lib/metadata";
import { getGalleryItems } from "@/services/gallery.service";

export const metadata: Metadata = withSocialMetadata({
  title: "Hình ảnh",
  description:
    "Khám phá những khoảnh khắc đời sống, hậu trường, sự kiện và du lịch của Quang.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: `Hình ảnh | ${siteConfig.siteName}`,
    description: "Thư viện hình ảnh và những khoảnh khắc đáng nhớ của Quang.",
    url: "/gallery",
    images: [{ url: siteConfig.coverImage, alt: `Hình ảnh của ${siteConfig.creatorName}` }],
  },
});

export default function GalleryPage() {
  const items = getGalleryItems();
  const categories = Array.from(new Set(items.map((item) => item.category))).sort(
    (a, b) => a.localeCompare(b, "vi-VN"),
  );

  return (
    <div className="pb-20 sm:pb-24">
      <header className="border-b border-[var(--border)] bg-[var(--background-secondary)] py-14 sm:py-20">
        <Container>
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--primary)] uppercase">
            Những khung hình đáng nhớ
          </p>
          <h1 className="mt-3 max-w-3xl text-[length:var(--text-h1)] font-bold leading-tight tracking-[-0.04em]">
            Hình ảnh từ hành trình sáng tạo và đời sống
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
            Một nơi lưu lại những buổi quay, chuyến đi, sự kiện và các khoảnh khắc bình thường mình yêu thích.
          </p>
        </Container>
      </header>

      <Container className="pt-12 sm:pt-16">
        <GalleryExplorer items={items} categories={categories} />
      </Container>
    </div>
  );
}
