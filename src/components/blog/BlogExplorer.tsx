"use client";

import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { PostCard, type PostCardPost } from "@/components/blog/PostCard";

const INITIAL_POST_COUNT = 6;
const ALL_CATEGORIES = "Tất cả";

interface BlogExplorerProps {
  posts: readonly PostCardPost[];
  categories: readonly string[];
  tags: readonly string[];
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("vi-VN");
}

export function BlogExplorer({ posts, categories, tags }: BlogExplorerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [tag, setTag] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_POST_COUNT);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = normalize(query);

    return posts.filter((post) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        normalize(post.title).includes(normalizedQuery) ||
        normalize(post.excerpt).includes(normalizedQuery);
      const matchesCategory =
        category === ALL_CATEGORIES || post.category === category;
      const matchesTag = tag.length === 0 || post.tags.includes(tag);

      return matchesQuery && matchesCategory && matchesTag;
    });
  }, [category, posts, query, tag]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasActiveFilters =
    query.trim().length > 0 || category !== ALL_CATEGORIES || tag.length > 0;

  function resetFilters() {
    setQuery("");
    setCategory(ALL_CATEGORIES);
    setTag("");
    setVisibleCount(INITIAL_POST_COUNT);
  }

  return (
    <section aria-labelledby="all-posts-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--primary)] uppercase">
            Khám phá
          </p>
          <h2
            id="all-posts-title"
            className="mt-2 text-[length:var(--text-h2)] font-bold tracking-[-0.03em]"
          >
            Tất cả bài viết
          </h2>
        </div>
        <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
          {filteredPosts.length} kết quả
        </p>
      </div>

      <div className="mt-7 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.34fr)_auto]">
          <label className="flex min-h-12 min-w-0 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--background)] px-4 text-[var(--text-muted)] focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary-soft)]">
            <Search size={19} aria-hidden="true" />
            <span className="sr-only">Tìm bài viết</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(INITIAL_POST_COUNT);
              }}
              placeholder="Tìm theo tiêu đề hoặc mô tả..."
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
          </label>

          <label className="flex min-h-12 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--background)] px-4 text-[var(--text-muted)] focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary-soft)]">
            <SlidersHorizontal size={18} aria-hidden="true" />
            <span className="sr-only">Lọc theo thẻ</span>
            <select
              value={tag}
              onChange={(event) => {
                setTag(event.target.value);
                setVisibleCount(INITIAL_POST_COUNT);
              }}
              className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm text-[var(--text-primary)] outline-none"
            >
              <option value="">Tất cả thẻ</option>
              {tags.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          {hasActiveFilters ? (
            <Button variant="ghost" onClick={resetFilters} className="md:self-stretch">
              <RotateCcw size={17} aria-hidden="true" /> Xóa bộ lọc
            </Button>
          ) : null}
        </div>

        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label="Lọc theo danh mục"
        >
          {[ALL_CATEGORIES, ...categories].map((item) => {
            const isActive = category === item;
            return (
              <button
                type="button"
                key={item}
                aria-pressed={isActive}
                onClick={() => {
                  setCategory(item);
                  setVisibleCount(INITIAL_POST_COUNT);
                }}
                className={`min-h-11 rounded-full border px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                  isActive
                    ? "border-transparent bg-[var(--primary)] text-white"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {visiblePosts.length > 0 ? (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePosts.map((post) => (
              <PostCard post={post} key={post.id} />
            ))}
          </div>
          {visiblePosts.length < filteredPosts.length ? (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setVisibleCount((count) => count + INITIAL_POST_COUNT)}
              >
                Xem thêm bài viết
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          className="mt-8"
          title="Không tìm thấy bài viết"
          description="Thử một từ khóa khác hoặc xóa bộ lọc để xem toàn bộ bài viết."
          action={
            hasActiveFilters ? (
              <Button variant="outline" onClick={resetFilters}>
                <RotateCcw size={17} aria-hidden="true" /> Xóa bộ lọc
              </Button>
            ) : undefined
          }
        />
      )}
    </section>
  );
}
