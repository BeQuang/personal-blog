import { ArrowLeft, CalendarDays, Clock3, Eye, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { PostCard } from "@/components/blog/PostCard";
import { PostContent } from "@/components/blog/PostContent";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { LinkButton } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { siteConfig } from "@/config/site.config";
import { withSocialMetadata } from "@/lib/metadata";
import {
  getPostBySlug,
  getPublishedPosts,
  getRelatedPosts,
} from "@/services/post.service";
import { formatDate } from "@/utils/date";
import { formatViewCount } from "@/utils/format";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (await getPublishedPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const canonical = `/blog/${post.slug}`;
  const image = post.coverImage ?? post.thumbnail;

  return withSocialMetadata({
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    alternates: { canonical },
    authors: [{ name: post.author.name }],
    openGraph: {
      type: "article",
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt,
      url: canonical,
      images: [{ url: image, alt: `Ảnh bìa bài viết ${post.title}` }],
      authors: [post.author.name],
      tags: [...post.tags],
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt,
      images: [image],
    },
  });
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publicationDate = post.publishedAt ?? post.createdAt;
  const relatedPosts = await getRelatedPosts(post, 3);
  const canonicalUrl = new URL(`/blog/${post.slug}`, siteConfig.siteUrl).toString();

  return (
    <article className="pb-20 sm:pb-24">
      <AnalyticsView type="post" entityId={post.id} />
      <header className="border-b border-[var(--border)] bg-[var(--background-secondary)] py-8 sm:py-12">
        <Container size="article">
          <nav aria-label="Breadcrumb" className="text-sm text-[var(--text-muted)]">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-[var(--primary)]">Trang chủ</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/blog" className="hover:text-[var(--primary)]">Bài viết</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="max-w-64 truncate text-[var(--text-secondary)]">
                {post.title}
              </li>
            </ol>
          </nav>

          <span className="mt-8 inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
            {post.category}
          </span>
          <h1 className="mt-4 text-[length:var(--text-h1)] font-bold leading-[1.14] tracking-[-0.045em]">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
            {post.excerpt}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-2 font-semibold text-[var(--text-primary)]">
              <UserRound size={17} aria-hidden="true" /> {post.author.name}
            </span>
            <time dateTime={publicationDate} className="inline-flex items-center gap-2">
              <CalendarDays size={17} aria-hidden="true" /> {formatDate(publicationDate)}
            </time>
            <span className="inline-flex items-center gap-2">
              <Clock3 size={17} aria-hidden="true" /> {post.readingTime} phút đọc
            </span>
            {post.viewCount !== undefined ? (
              <span className="inline-flex items-center gap-2">
                <Eye size={17} aria-hidden="true" /> {formatViewCount(post.viewCount)} lượt xem
              </span>
            ) : null}
          </div>
        </Container>
      </header>

      <Container className="pt-8 sm:pt-12">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
          <Image
            src={post.coverImage ?? post.thumbnail}
            alt={`Ảnh bìa bài viết ${post.title}`}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
        </div>
      </Container>

      <Container size="article" className="pt-10 sm:pt-14">
        <PostContent blocks={post.content} />

        <footer className="mt-12 border-t border-[var(--border)] pt-8">
          <div className="flex flex-wrap gap-2" aria-label="Thẻ bài viết">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]"
              >
                #{tag}
              </span>
            ))}
          </div>
          <div className="mt-8">
            <ShareButtons title={post.title} url={canonicalUrl} />
          </div>
        </footer>

        <aside className="mt-12 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_16%,var(--surface)),color-mix(in_srgb,var(--secondary)_10%,var(--surface)))] p-7 sm:p-10">
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--primary)] uppercase">
            Tiếp tục khám phá
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
            Còn nhiều câu chuyện đang chờ bạn
          </h2>
          <p className="mt-3 max-w-xl leading-7 text-[var(--text-secondary)]">
            Xem thêm các bài viết mới về sáng tạo nội dung, công nghệ và đời sống.
          </p>
          <LinkButton href="/blog" size="lg" className="mt-6">
            <ArrowLeft size={18} aria-hidden="true" /> Xem tất cả bài viết
          </LinkButton>
        </aside>
      </Container>

      {relatedPosts.length > 0 ? (
        <section className="mt-16 border-t border-[var(--border)] pt-14" aria-labelledby="related-posts-title">
          <Container>
            <h2
              id="related-posts-title"
              className="text-[length:var(--text-h2)] font-bold tracking-[-0.03em]"
            >
              Đọc tiếp
            </h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <PostCard post={relatedPost} key={relatedPost.id} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </article>
  );
}
