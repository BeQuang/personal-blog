import Link from "next/link";

import { Container } from "@/components/common/Container";
import { SocialIcon } from "@/components/common/SocialIcon";
import { footerNavigation, legalNavigation } from "@/config/navigation.config";
import { siteConfig } from "@/config/site.config";
import { socialLinks } from "@/data/social-links";
import { filterEnabledSocialLinks } from "@/utils/data";

const enabledSocialLinks = filterEnabledSocialLinks(socialLinks);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--background-secondary)]">
      <Container className="py-12 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div className="max-w-md">
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <span className="brand-mark" aria-hidden="true">
                Q
              </span>
              <span className="font-bold text-[var(--text-primary)]">
                {siteConfig.siteName}
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
              {siteConfig.siteDescription}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Mạng xã hội">
              {enabledSocialLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${link.label} của ${siteConfig.creatorName}`}
                    className="grid size-10 place-items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  >
                    <SocialIcon platform={link.platform} size={18} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Khám phá
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 text-sm">
              {footerNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[var(--text-secondary)] transition-colors hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Thông tin
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {legalNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[var(--text-secondary)] transition-colors hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-5 text-[var(--text-muted)]">
              Liên hệ hợp tác: {siteConfig.contactEmail}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--border)] pt-6 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} {siteConfig.siteName}. Mọi quyền được bảo lưu.</p>
          <p>Nội dung được xây dựng với sự tôn trọng cộng đồng.</p>
        </div>
      </Container>
    </footer>
  );
}
