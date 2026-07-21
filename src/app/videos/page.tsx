import type { Metadata } from "next";

import { Container } from "@/components/common/Container";
import { FeaturedVideo } from "@/components/videos/FeaturedVideo";
import { VideoExplorer } from "@/components/videos/VideoExplorer";
import { siteConfig } from "@/config/site.config";
import { withSocialMetadata } from "@/lib/metadata";
import { getFeaturedVideos, getVideos } from "@/services/video.service";

export const metadata: Metadata = withSocialMetadata({
  title: "Video",
  description:
    "Khám phá video mới của Quang trên YouTube, TikTok, Instagram và Facebook.",
  alternates: { canonical: "/videos" },
  openGraph: {
    title: `Video | ${siteConfig.siteName}`,
    description: "Video về sáng tạo nội dung, công nghệ, hậu trường và đời sống.",
    url: "/videos",
    images: [{ url: siteConfig.coverImage, alt: `Video của ${siteConfig.creatorName}` }],
  },
});

export default async function VideosPage() {
  const videos = await getVideos();
  const featuredVideo = (await getFeaturedVideos(1))[0] ?? videos[0];
  const topics = Array.from(new Set(videos.map((video) => video.topic))).sort((a, b) =>
    a.localeCompare(b, "vi-VN"),
  );

  return (
    <div className="pb-20 sm:pb-24">
      <header className="border-b border-[var(--border)] bg-[var(--background-secondary)] py-14 sm:py-20">
        <Container>
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--primary)] uppercase">
            Xem và khám phá
          </p>
          <h1 className="mt-3 max-w-3xl text-[length:var(--text-h1)] font-bold leading-tight tracking-[-0.04em]">
            Video từ những nền tảng mình đang chia sẻ
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
            Nội dung ngắn, vlog và những câu chuyện hậu trường trên YouTube, TikTok, Instagram và Facebook.
          </p>
        </Container>
      </header>

      {featuredVideo ? (
        <section className="py-12 sm:py-16" aria-label="Video nổi bật">
          <Container>
            <FeaturedVideo video={featuredVideo} />
          </Container>
        </section>
      ) : null}

      <Container className="pt-4 sm:pt-8">
        <VideoExplorer videos={videos} topics={topics} />
      </Container>
    </div>
  );
}
