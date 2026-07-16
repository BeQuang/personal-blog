import { ArrowUpRight, Clock3, Eye, Play, Sparkles } from "lucide-react";
import Image from "next/image";

import { videoPlatformLabels } from "@/components/videos/VideoCard";
import type { VideoItem } from "@/types";
import { formatDate } from "@/utils/date";
import { formatViewCount } from "@/utils/format";

interface FeaturedVideoProps {
  video: VideoItem;
}

export function FeaturedVideo({ video }: FeaturedVideoProps) {
  const isPortrait = video.orientation === "portrait";

  return (
    <article className="grid overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface)] shadow-[var(--shadow-card)] lg:grid-cols-[0.82fr_1.18fr]">
      <a
        href={video.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Xem video nổi bật ${video.title} (mở trong tab mới)`}
        className="relative mx-auto block w-full overflow-hidden bg-[var(--surface-elevated)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-inset"
      >
        <div
          className={`relative mx-auto h-full w-full ${
            isPortrait ? "aspect-[9/16] max-w-sm" : "aspect-video lg:min-h-full"
          }`}
        >
          <Image
            src={video.thumbnail}
            alt={`Ảnh thu nhỏ video ${video.title}`}
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 42vw"
            className="object-cover"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/60 text-white backdrop-blur-md transition-transform hover:scale-105">
            <Play size={24} fill="currentColor" aria-hidden="true" />
          </span>
        </div>
      </a>

      <div className="flex flex-col items-start justify-center p-6 sm:p-10 lg:p-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
          <Sparkles size={14} aria-hidden="true" /> Video nổi bật
        </span>
        <p className="mt-5 text-xs font-bold tracking-[0.12em] text-[var(--primary)] uppercase">
          {videoPlatformLabels[video.platform]} · {video.topic}
        </p>
        <h2 className="mt-3 text-2xl font-bold leading-tight tracking-[-0.035em] sm:text-3xl">
          {video.title}
        </h2>
        {video.description ? (
          <p className="mt-4 leading-7 text-[var(--text-secondary)]">{video.description}</p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]">
          <time dateTime={video.publishedAt}>{formatDate(video.publishedAt)}</time>
          {video.duration ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={15} aria-hidden="true" /> {video.duration}
            </span>
          ) : null}
          {video.viewCount !== undefined ? (
            <span className="inline-flex items-center gap-1.5">
              <Eye size={15} aria-hidden="true" /> {formatViewCount(video.viewCount)} lượt xem
            </span>
          ) : null}
        </div>
        <a
          href={video.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-lg)] bg-[linear-gradient(135deg,var(--primary),var(--secondary))] px-5 font-bold text-white outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
        >
          Xem video <ArrowUpRight size={18} aria-hidden="true" />
          <span className="sr-only">(mở trong tab mới)</span>
        </a>
      </div>
    </article>
  );
}
