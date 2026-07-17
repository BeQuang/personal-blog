"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/common/Button";
import { SocialLinksDialog } from "@/components/layout/SocialLinksDialog";
import { mainNavigation } from "@/config/navigation.config";
import { siteConfig } from "@/config/site.config";
import { cn } from "@/utils/cn";
import type { SocialLink } from "@/types";

function isActiveRoute(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileMenu({ socialLinks }: { socialLinks: readonly SocialLink[] }) {
  const pathname = usePathname();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="xl:hidden"
          aria-label="Mở menu"
        >
          <Menu size={21} aria-hidden="true" />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="mobile-menu-content">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <div>
              <Dialog.Title className="font-bold text-[var(--text-primary)]">
                Menu
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-[var(--text-muted)]">
                {siteConfig.siteName}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Đóng menu">
                <X size={21} aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>

          <nav aria-label="Điều hướng trên thiết bị di động" className="p-4">
            <ul className="space-y-1">
              {mainNavigation.map((item) => {
                const active = isActiveRoute(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Dialog.Close asChild>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center rounded-[var(--radius-md)] px-4 text-base font-semibold transition-colors",
                          active
                            ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
                        )}
                      >
                        {item.label}
                      </Link>
                    </Dialog.Close>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto border-t border-[var(--border)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <SocialLinksDialog links={socialLinks} className="w-full" nested />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
