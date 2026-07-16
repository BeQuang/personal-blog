"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/common/Button";
import type { GalleryItem } from "@/types";

interface GalleryLightboxProps {
  items: readonly GalleryItem[];
}

export function GalleryLightbox({ items }: GalleryLightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const selected = items[selectedIndex];

  function select(index: number) {
    setSelectedIndex(index);
    setOpen(true);
  }

  function move(direction: -1 | 1) {
    setSelectedIndex((current) => (current + direction + items.length) % items.length);
  }

  if (!selected) return null;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="gallery-grid">
        {items.map((item, index) => (
          <button
            type="button"
            className="gallery-tile group"
            key={item.id}
            onClick={() => select(index)}
            aria-label={`Xem ảnh: ${item.title}`}
          >
            <Image
              src={item.thumbnailUrl ?? item.imageUrl}
              alt={item.alt}
              fill
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <span className="gallery-tile-overlay" />
            <span className="gallery-tile-copy">
              <small>{item.category}</small>
              <strong>{item.title}</strong>
            </span>
            <span className="gallery-expand" aria-hidden="true">
              <Expand size={17} />
            </span>
          </button>
        ))}
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="gallery-dialog"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              move(-1);
            }

            if (event.key === "ArrowRight") {
              event.preventDefault();
              move(1);
            }
          }}
        >
          <Dialog.Title className="sr-only">{selected.title}</Dialog.Title>
          <Dialog.Description className="sr-only">
            {selected.description ?? selected.alt}
          </Dialog.Description>

          <div className="gallery-dialog-image">
            <Image
              src={selected.imageUrl}
              alt={selected.alt}
              fill
              sizes="min(94vw, 1100px)"
              className="object-contain"
            />
          </div>

          <div className="gallery-dialog-caption">
            <div>
              <small>{selected.category}</small>
              <p>{selected.title}</p>
              {selected.description ? (
                <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">
                  {selected.description}
                </span>
              ) : null}
            </div>
            <span className="shrink-0">{selectedIndex + 1} / {items.length}</span>
          </div>

          <Button
            variant="secondary"
            size="icon"
            className="gallery-control gallery-control-prev"
            onClick={() => move(-1)}
            aria-label="Xem ảnh trước"
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="gallery-control gallery-control-next"
            onClick={() => move(1)}
            aria-label="Xem ảnh tiếp theo"
          >
            <ChevronRight aria-hidden="true" />
          </Button>
          <Dialog.Close asChild>
            <Button
              variant="secondary"
              size="icon"
              className="gallery-control gallery-control-close"
              aria-label="Đóng thư viện ảnh"
            >
              <X aria-hidden="true" />
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
