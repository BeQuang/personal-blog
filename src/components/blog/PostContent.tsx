import { ExternalLink } from "lucide-react";
import Image from "next/image";

import { LinkButton } from "@/components/common/Button";
import type { PostContentBlock } from "@/types";

interface PostContentProps {
  blocks: readonly PostContentBlock[];
}

function getVideoEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId && /^[\w-]+$/.test(videoId)
        ? `https://www.youtube-nocookie.com/embed/${videoId}`
        : null;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const videoId =
        url.pathname === "/watch"
          ? url.searchParams.get("v")
          : url.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/)?.[1];

      return videoId && /^[\w-]+$/.test(videoId)
        ? `https://www.youtube-nocookie.com/embed/${videoId}`
        : null;
    }

    if (hostname === "vimeo.com" || hostname === "player.vimeo.com") {
      const videoId = url.pathname.split("/").filter(Boolean).at(-1);
      return videoId && /^\d+$/.test(videoId)
        ? `https://player.vimeo.com/video/${videoId}`
        : null;
    }

    return null;
  } catch {
    return null;
  }
}

export function PostContent({ blocks }: PostContentProps) {
  return (
    <div className="space-y-6 text-[1.05rem] leading-8 text-[var(--text-secondary)]">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        switch (block.type) {
          case "heading":
            return block.level === 2 ? (
              <h2
                key={key}
                className="pt-5 text-2xl font-bold leading-tight tracking-[-0.03em] text-[var(--text-primary)] sm:text-3xl"
              >
                {block.text}
              </h2>
            ) : (
              <h3
                key={key}
                className="pt-3 text-xl font-bold leading-tight text-[var(--text-primary)] sm:text-2xl"
              >
                {block.text}
              </h3>
            );

          case "paragraph":
            return <p key={key}>{block.text}</p>;

          case "image":
            return (
              <figure key={key} className="py-2">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--surface-elevated)]">
                  <Image
                    src={block.src}
                    alt={block.alt}
                    fill
                    sizes="(max-width: 800px) 100vw, 800px"
                    className="object-cover"
                  />
                </div>
                {block.caption ? (
                  <figcaption className="mt-3 text-center text-sm text-[var(--text-muted)]">
                    {block.caption}
                  </figcaption>
                ) : null}
              </figure>
            );

          case "quote":
            return (
              <blockquote
                key={key}
                className="rounded-r-[var(--radius-lg)] border-l-4 border-[var(--primary)] bg-[var(--primary-soft)] px-5 py-5 text-lg font-medium italic text-[var(--text-primary)] sm:px-7"
              >
                <p>{block.text}</p>
                {block.attribution ? (
                  <footer className="mt-3 text-sm not-italic text-[var(--text-muted)]">
                    — {block.attribution}
                  </footer>
                ) : null}
              </blockquote>
            );

          case "list": {
            const List = block.style === "ordered" ? "ol" : "ul";
            return (
              <List
                key={key}
                className={`space-y-2 pl-6 marker:font-bold marker:text-[var(--primary)] ${
                  block.style === "ordered" ? "list-decimal" : "list-disc"
                }`}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={`${item}-${itemIndex}`} className="pl-1">
                    {item}
                  </li>
                ))}
              </List>
            );
          }

          case "code":
            return (
              <div key={key} className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[#09090b]">
                <div className="border-b border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400">
                  {block.language}
                </div>
                <pre className="overflow-x-auto p-5 text-sm leading-6 text-zinc-100">
                  <code>{block.code}</code>
                </pre>
              </div>
            );

          case "video": {
            const embedUrl = getVideoEmbedUrl(block.url);

            if (embedUrl) {
              return (
                <div
                  key={key}
                  className="relative aspect-video overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-black"
                >
                  <iframe
                    src={embedUrl}
                    title={block.title}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 size-full border-0"
                  />
                </div>
              );
            }

            return (
              <a
                key={key}
                href={block.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <span>{block.title}</span>
                <ExternalLink size={19} aria-hidden="true" />
              </a>
            );
          }

          case "cta":
            return (
              <aside
                key={key}
                className="rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface)] p-6 sm:p-8"
              >
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{block.title}</h3>
                <p className="mt-2 text-base leading-7">{block.description}</p>
                <LinkButton href={block.href} className="mt-5">
                  {block.label}
                </LinkButton>
              </aside>
            );

          case "divider":
            return <hr key={key} className="my-9 border-0 border-t border-[var(--border)]" />;
        }
      })}
    </div>
  );
}
