import { ArrowRight, Clock3, Eye, Sparkles } from "lucide-react";
import Image from "next/image";

import { LinkButton } from "@/components/common/Button";
import type { BlogPost } from "@/types";
import { formatDate } from "@/utils/date";
import { formatViewCount } from "@/utils/format";

interface FeaturedPostProps {
  post: BlogPost;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  const publicationDate = post.publishedAt ?? post.createdAt;

  return (
    <article className="grid overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface)] shadow-[var(--shadow-card)] lg:grid-cols-[1.08fr_0.92fr]">
      <div className="relative min-h-72 overflow-hidden bg-[var(--surface-elevated)] sm:min-h-[420px] lg:min-h-full">
        <Image
          src={post.coverImage ?? post.thumbnail}
          alt={`Ảnh bìa bài viết ${post.title}`}
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 54vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-r" />
        <span className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
          <Sparkles size={14} aria-hidden="true" /> Bài viết nổi bật
        </span>
      </div>

      <div className="flex flex-col items-start justify-center p-6 sm:p-10 lg:p-12">
        <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
          {post.category}
        </span>
        <h2 className="mt-4 text-2xl font-bold leading-tight tracking-[-0.035em] text-[var(--text-primary)] sm:text-3xl">
          {post.title}
        </h2>
        <p className="mt-4 leading-7 text-[var(--text-secondary)]">{post.excerpt}</p>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]">
          <time dateTime={publicationDate}>{formatDate(publicationDate)}</time>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={15} aria-hidden="true" /> {post.readingTime} phút đọc
          </span>
          {post.viewCount !== undefined ? (
            <span className="inline-flex items-center gap-1.5">
              <Eye size={15} aria-hidden="true" /> {formatViewCount(post.viewCount)} lượt xem
            </span>
          ) : null}
        </div>
        <LinkButton href={`/blog/${post.slug}`} size="lg" className="mt-7">
          Đọc bài viết <ArrowRight size={18} aria-hidden="true" />
        </LinkButton>
      </div>
    </article>
  );
}
