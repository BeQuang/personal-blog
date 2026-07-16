import type { Metadata } from "next";

import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { FeaturedPost } from "@/components/blog/FeaturedPost";
import type { PostCardPost } from "@/components/blog/PostCard";
import { Container } from "@/components/common/Container";
import { siteConfig } from "@/config/site.config";
import { getFeaturedPosts, getPublishedPosts } from "@/services/post.service";

export const metadata: Metadata = {
  title: "Bài viết",
  description:
    "Khám phá các bài viết mới về sáng tạo nội dung, công nghệ, đời sống và những câu chuyện hậu trường của Quang.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `Bài viết | ${siteConfig.siteName}`,
    description:
      "Kinh nghiệm sáng tạo nội dung, công nghệ, đời sống và những câu chuyện hậu trường.",
    url: "/blog",
    images: [{ url: siteConfig.coverImage, alt: `Bài viết của ${siteConfig.creatorName}` }],
  },
};

export default function BlogPage() {
  const posts = getPublishedPosts();
  const featuredPost = getFeaturedPosts(1)[0] ?? posts[0];
  const postSummaries: PostCardPost[] = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    thumbnail: post.thumbnail,
    category: post.category,
    readingTime: post.readingTime,
    viewCount: post.viewCount,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    tags: post.tags,
  }));
  const categories = Array.from(new Set(posts.map((post) => post.category))).sort(
    (a, b) => a.localeCompare(b, "vi-VN"),
  );
  const tags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort((a, b) =>
    a.localeCompare(b, "vi-VN"),
  );

  return (
    <div className="pb-20 sm:pb-24">
      <header className="border-b border-[var(--border)] bg-[var(--background-secondary)] py-14 sm:py-20">
        <Container>
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--primary)] uppercase">
            Góc chia sẻ
          </p>
          <h1 className="mt-3 max-w-3xl text-[length:var(--text-h1)] font-bold leading-tight tracking-[-0.04em]">
            Bài viết, trải nghiệm và những điều mình đang học
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
            Câu chuyện thực tế về sáng tạo nội dung, công nghệ và cách duy trì một nhịp làm việc bền vững.
          </p>
        </Container>
      </header>

      {featuredPost ? (
        <section className="py-12 sm:py-16" aria-label="Bài viết nổi bật">
          <Container>
            <FeaturedPost post={featuredPost} />
          </Container>
        </section>
      ) : null}

      <Container as="div" className="pt-4 sm:pt-8">
        <BlogExplorer posts={postSummaries} categories={categories} tags={tags} />
      </Container>
    </div>
  );
}
