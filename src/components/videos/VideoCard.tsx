import { Clock3, ExternalLink, Eye, Play } from "lucide-react";
import Image from "next/image";

import type { VideoItem, VideoPlatform } from "@/types";
import { formatDate } from "@/utils/date";
import { formatViewCount } from "@/utils/format";

export const videoPlatformLabels: Record<VideoPlatform, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  internal: "Video",
};

interface VideoCardProps {
  video: VideoItem;
}

export function VideoCard({ video }: VideoCardProps) {
  const isPortrait = video.orientation === "portrait";

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] transition duration-200 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-card)]">
      <a
        href={video.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Xem video ${video.title} trên ${videoPlatformLabels[video.platform]} (mở trong tab mới)`}
        className="flex h-full flex-col rounded-[var(--radius-lg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-inset"
      >
        <div
          className={`relative overflow-hidden bg-[var(--surface-elevated)] ${
            isPortrait ? "aspect-[9/16]" : "aspect-video"
          }`}
        >
          <Image
            src={video.thumbnail}
            alt={`Ảnh thu nhỏ video ${video.title}`}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
          <span className="absolute top-3 left-3 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
            {videoPlatformLabels[video.platform]}
          </span>
          {video.duration ? (
            <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
              <Clock3 size={13} aria-hidden="true" /> {video.duration}
            </span>
          ) : null}
          <span className="absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/60 text-white backdrop-blur-md transition-transform group-hover:scale-105">
            <Play size={21} fill="currentColor" aria-hidden="true" />
          </span>
        </div>

        <div className="flex min-h-44 flex-1 flex-col p-5">
          <span className="text-xs font-bold text-[var(--primary)]">{video.topic}</span>
          <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-7 tracking-[-0.02em] text-[var(--text-primary)]">
            {video.title}
          </h3>
          {video.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
              {video.description}
            </p>
          ) : null}
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-4 text-xs text-[var(--text-muted)]">
            <time dateTime={video.publishedAt}>{formatDate(video.publishedAt)}</time>
            {video.viewCount !== undefined ? (
              <span className="inline-flex items-center gap-1.5">
                <Eye size={15} aria-hidden="true" /> {formatViewCount(video.viewCount)} lượt xem
              </span>
            ) : null}
            <ExternalLink className="ml-auto" size={16} aria-hidden="true" />
          </div>
        </div>
      </a>
    </article>
  );
}
