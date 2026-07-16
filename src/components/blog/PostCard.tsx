import { ArrowRight, Clock3, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { BlogPost } from "@/types";
import { formatDate } from "@/utils/date";
import { formatViewCount } from "@/utils/format";

export type PostCardPost = Pick<
  BlogPost,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "thumbnail"
  | "category"
  | "readingTime"
  | "viewCount"
  | "publishedAt"
  | "createdAt"
  | "tags"
>;

interface PostCardProps {
  post: PostCardPost;
}

export function PostCard({ post }: PostCardProps) {
  const href = `/blog/${post.slug}`;
  const publicationDate = post.publishedAt ?? post.createdAt;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] transition duration-200 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-card)]">
      <Link
        href={href}
        className="relative block aspect-[16/10] overflow-hidden bg-[var(--surface-elevated)]"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={post.thumbnail}
          alt=""
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <span className="font-bold text-[var(--primary)]">{post.category}</span>
          <time dateTime={publicationDate}>{formatDate(publicationDate)}</time>
        </div>

        <h3 className="mt-3 text-lg font-bold leading-7 tracking-[-0.02em] text-[var(--text-primary)]">
          <Link
            href={href}
            className="rounded-sm outline-none focus-visible:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--text-secondary)]">
          {post.excerpt}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-5 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={15} aria-hidden="true" />
            {post.readingTime} phút đọc
          </span>
          {post.viewCount !== undefined ? (
            <span className="inline-flex items-center gap-1.5">
              <Eye size={15} aria-hidden="true" />
              {formatViewCount(post.viewCount)} lượt xem
            </span>
          ) : null}
          <Link
            href={href}
            aria-label={`Đọc bài: ${post.title}`}
            className="ml-auto grid size-11 place-items-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)] transition-transform hover:translate-x-0.5"
          >
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
