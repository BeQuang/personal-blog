"use client";

import { Images, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { GalleryLightbox } from "@/components/home/GalleryLightbox";
import type { GalleryItem } from "@/types";

const ALL_CATEGORIES = "Tất cả";

interface GalleryExplorerProps {
  items: readonly GalleryItem[];
  categories: readonly string[];
}

export function GalleryExplorer({ items, categories }: GalleryExplorerProps) {
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const filteredItems = useMemo(
    () =>
      category === ALL_CATEGORIES
        ? items
        : items.filter((item) => item.category === category),
    [category, items],
  );

  return (
    <section aria-labelledby="gallery-library-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--primary)] uppercase">
            Khoảnh khắc
          </p>
          <h2
            id="gallery-library-title"
            className="mt-2 text-[length:var(--text-h2)] font-bold tracking-[-0.03em]"
          >
            Thư viện hình ảnh
          </h2>
        </div>
        <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
          {filteredItems.length} hình ảnh
        </p>
      </div>

      <div
        className="mt-7 flex flex-wrap gap-2 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
        role="group"
        aria-label="Lọc ảnh theo danh mục"
      >
        {[ALL_CATEGORIES, ...categories].map((item) => {
          const isActive = category === item;
          return (
            <button
              type="button"
              key={item}
              aria-pressed={isActive}
              onClick={() => setCategory(item)}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                isActive
                  ? "border-transparent bg-[var(--action-primary)] text-white"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {filteredItems.length > 0 ? (
        <div className="mt-8">
          <GalleryLightbox key={category} items={filteredItems} />
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          icon={<Images size={22} aria-hidden="true" />}
          title="Chưa có hình ảnh trong danh mục này"
          description="Chọn một danh mục khác hoặc quay lại xem toàn bộ thư viện."
          action={
            category !== ALL_CATEGORIES ? (
              <Button variant="outline" onClick={() => setCategory(ALL_CATEGORIES)}>
                <RotateCcw size={17} aria-hidden="true" /> Xem tất cả
              </Button>
            ) : undefined
          }
        />
      )}
    </section>
  );
}
