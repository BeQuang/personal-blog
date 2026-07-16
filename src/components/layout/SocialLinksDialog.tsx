"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ExternalLink, Users, X } from "lucide-react";

import { Button, type ButtonVariant } from "@/components/common/Button";
import { SocialIcon } from "@/components/common/SocialIcon";
import { trackSocialClick } from "@/lib/analytics";
import { getEnabledSocialLinks } from "@/services/social.service";
import { cn } from "@/utils/cn";
import { formatViewCount } from "@/utils/format";

interface SocialLinksDialogProps {
  className?: string;
  compact?: boolean;
  nested?: boolean;
  variant?: ButtonVariant;
}

const enabledSocialLinks = getEnabledSocialLinks();

export function SocialLinksDialog({
  className,
  compact = false,
  nested = false,
  variant = "primary",
}: SocialLinksDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          size={compact ? "icon" : "sm"}
          variant={variant}
          className={className}
          aria-label={compact ? "Theo dõi Quang trên mạng xã hội" : undefined}
        >
          <Users size={17} aria-hidden="true" />
          {compact ? null : <span>Theo dõi</span>}
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className={cn("dialog-overlay", nested && "dialog-overlay-nested")}
        />
        <Dialog.Content
          className={cn("dialog-content", nested && "dialog-content-nested")}
        >
          <div className="pr-12">
            <Dialog.Title className="text-2xl font-bold tracking-[-0.03em] text-[var(--text-primary)]">
              Kết nối cùng Quang
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Chọn nền tảng bạn thường dùng để xem nội dung mới và những cập nhật gần nhất.
            </Dialog.Description>
          </div>

          <Dialog.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Đóng danh sách mạng xã hội"
              className="absolute top-4 right-4"
            >
              <X size={20} aria-hidden="true" />
            </Button>
          </Dialog.Close>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {enabledSocialLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackSocialClick(link.platform)}
                  className="group flex min-h-20 items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--primary-soft)] text-[var(--primary)]">
                    <SocialIcon platform={link.platform} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                      {link.label}
                      <ExternalLink
                        size={13}
                        aria-hidden="true"
                        className="opacity-50 transition-opacity group-hover:opacity-100"
                      />
                    </span>
                    <span className="block truncate text-xs text-[var(--text-muted)]">
                      {link.username ?? "Xem trang cá nhân"}
                      {link.followerCount
                        ? ` · ${formatViewCount(link.followerCount)} người theo dõi`
                        : ""}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
