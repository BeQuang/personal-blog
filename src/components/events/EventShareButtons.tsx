"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

interface EventShareButtonsProps {
  title: string;
  url: string;
}

export function EventShareButtons({ title, url }: EventShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function share() {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({ title, url });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        await copyLink();
      }
    }
  }

  return (
    <div>
      <p className="text-sm font-bold text-[var(--text-primary)]">Chia sẻ sự kiện</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={share}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          <Share2 size={17} aria-hidden="true" /> Chia sẻ
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          {copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
          {copied ? "Đã sao chép" : "Sao chép link"}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? "Đã sao chép liên kết sự kiện." : ""}
      </p>
    </div>
  );
}
