"use client";

import MuxPlayer from "@mux/mux-player-react/lazy";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/common/Button";
import { trackVideoView } from "@/lib/analytics";
import type { VideoItem } from "@/types";

interface VideoPlaybackTriggerProps {
  video: VideoItem;
  className: string;
  ariaLabel: string;
  children: ReactNode;
}

export function VideoPlaybackTrigger({ video, className, ariaLabel, children }: VideoPlaybackTriggerProps) {
  if (video.platform !== "internal" || !video.playbackId) {
    return (
      <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} className={className} onClick={() => trackVideoView(video.id)}>
        {children}
      </a>
    );
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button type="button" aria-label={ariaLabel} className={className}>{children}</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content video-player-dialog">
          <div className="pr-12">
            <Dialog.Title className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
              {video.title}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-[var(--text-secondary)]">
              Phát video bằng Mux Player. Video không tự động phát.
            </Dialog.Description>
          </div>
          <MuxPlayer
            playbackId={video.playbackId}
            poster={video.thumbnail}
            title={video.title}
            loading="viewport"
            preload="metadata"
            autoPlay={false}
            metadata={{ video_id: video.id, video_title: video.title }}
            onPlay={() => trackVideoView(video.id)}
            className="mt-5 block aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] bg-black"
          />
          <Dialog.Close asChild>
            <Button variant="ghost" size="icon" aria-label="Đóng trình phát video" className="absolute top-4 right-4">
              <X size={20} aria-hidden="true" />
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
