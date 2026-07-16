"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { VideoCard } from "@/components/videos/VideoCard";
import type { VideoItem, VideoPlatform } from "@/types";

const INITIAL_VIDEO_COUNT = 6;
const ALL_PLATFORMS = "all";

type PublicVideoPlatform = Exclude<VideoPlatform, "internal">;
type PlatformFilter = typeof ALL_PLATFORMS | PublicVideoPlatform;

const platformFilters: readonly { value: PlatformFilter; label: string }[] = [
  { value: ALL_PLATFORMS, label: "Tất cả" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
];

interface VideoExplorerProps {
  videos: readonly VideoItem[];
  topics: readonly string[];
}

export function VideoExplorer({ videos, topics }: VideoExplorerProps) {
  const [platform, setPlatform] = useState<PlatformFilter>(ALL_PLATFORMS);
  const [topic, setTopic] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VIDEO_COUNT);

  const filteredVideos = useMemo(
    () =>
      videos.filter((video) => {
        const matchesPlatform =
          platform === ALL_PLATFORMS || video.platform === platform;
        const matchesTopic = topic.length === 0 || video.topic === topic;
        return matchesPlatform && matchesTopic;
      }),
    [platform, topic, videos],
  );
  const visibleVideos = filteredVideos.slice(0, visibleCount);
  const hasActiveFilters = platform !== ALL_PLATFORMS || topic.length > 0;

  function resetFilters() {
    setPlatform(ALL_PLATFORMS);
    setTopic("");
    setVisibleCount(INITIAL_VIDEO_COUNT);
  }

  return (
    <section aria-labelledby="video-library-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--primary)] uppercase">
            Thư viện video
          </p>
          <h2
            id="video-library-title"
            className="mt-2 text-[length:var(--text-h2)] font-bold tracking-[-0.03em]"
          >
            Xem theo cách bạn thích
          </h2>
        </div>
        <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
          {filteredVideos.length} video
        </p>
      </div>

      <div className="mt-7 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Lọc video theo nền tảng"
        >
          {platformFilters.map((item) => {
            const isActive = platform === item.value;
            return (
              <button
                type="button"
                key={item.value}
                aria-pressed={isActive}
                onClick={() => {
                  setPlatform(item.value);
                  setVisibleCount(INITIAL_VIDEO_COUNT);
                }}
                className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                  isActive
                    ? "border-transparent bg-[var(--primary)] text-white"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex min-h-12 w-full items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--background)] px-4 text-[var(--text-muted)] focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary-soft)] sm:max-w-xs">
            <SlidersHorizontal size={18} aria-hidden="true" />
            <span className="sr-only">Lọc video theo chủ đề</span>
            <select
              value={topic}
              onChange={(event) => {
                setTopic(event.target.value);
                setVisibleCount(INITIAL_VIDEO_COUNT);
              }}
              className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm text-[var(--text-primary)] outline-none"
            >
              <option value="">Tất cả chủ đề</option>
              {topics.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          {hasActiveFilters ? (
            <Button variant="ghost" onClick={resetFilters}>
              <RotateCcw size={17} aria-hidden="true" /> Xóa bộ lọc
            </Button>
          ) : null}
        </div>
      </div>

      {visibleVideos.length > 0 ? (
        <>
          <div className="mt-8 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleVideos.map((video) => (
              <VideoCard video={video} key={video.id} />
            ))}
          </div>
          {visibleVideos.length < filteredVideos.length ? (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setVisibleCount((count) => count + INITIAL_VIDEO_COUNT)}
              >
                Xem thêm video
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          className="mt-8"
          title="Không tìm thấy video"
          description="Thử một nền tảng hoặc chủ đề khác để tiếp tục khám phá."
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
