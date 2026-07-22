import Link from "next/link";

import { Container } from "@/components/common/Container";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { DesktopNavigation } from "@/components/layout/DesktopNavigation";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SocialLinksDialog } from "@/components/layout/SocialLinksDialog";
import type { SiteConfig, SocialLink } from "@/types";

export function Header({ socialLinks, settings }: { socialLinks: readonly SocialLink[]; settings: SiteConfig }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_84%,transparent)] backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--background)_72%,transparent)]">
      <Container className="flex min-h-16 items-center gap-3 py-2 lg:min-h-18">
        <Link
          href="/"
          aria-label={`${settings.siteName} – Trang chủ`}
          className="group flex min-w-0 items-center gap-3 rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          <span className="brand-mark" aria-hidden="true">
            Q
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold tracking-[-0.02em] text-[var(--text-primary)] sm:text-base">
              {settings.siteName}
            </span>
            <span className="hidden text-[11px] font-medium text-[var(--text-muted)] sm:block">
              Creator · Storyteller
            </span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1 lg:gap-2">
          <DesktopNavigation />
          <span className="mx-1 hidden h-6 w-px bg-[var(--border)] xl:block" />
          <ThemeToggle />
          <SocialLinksDialog links={socialLinks} className="hidden sm:inline-flex" />
          <MobileMenu socialLinks={socialLinks} siteName={settings.siteName} />
        </div>
      </Container>
    </header>
  );
}
