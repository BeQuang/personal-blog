import { Clock3, ExternalLink, FileText, Mail, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

import { Container } from "@/components/common/Container";
import { SocialIcon } from "@/components/common/SocialIcon";
import { ContactForm } from "@/components/contact/ContactForm";
import { expectedResponseTime } from "@/config/contact.config";
import { siteConfig } from "@/config/site.config";
import { withSocialMetadata } from "@/lib/metadata";
import { getEnabledSocialLinks } from "@/services/social.service";
import { formatViewCount } from "@/utils/format";

export const metadata: Metadata = withSocialMetadata({
  title: "Liên hệ hợp tác",
  description:
    "Liên hệ Quang Official cho booking quảng cáo, review sản phẩm, sự kiện và các dự án truyền thông.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Liên hệ hợp tác | ${siteConfig.siteName}`,
    description: "Thông tin liên hệ và biểu mẫu tiếp nhận brief hợp tác.",
    url: "/contact",
    images: [{ url: siteConfig.coverImage, alt: `Liên hệ ${siteConfig.creatorName}` }],
  },
});

export default async function ContactPage() {
  const socialLinks = (await getEnabledSocialLinks()).filter((link) => link.platform !== "email");

  return (
    <div className="pb-20 sm:pb-24">
      <header className="border-b border-[var(--border)] bg-[var(--background-secondary)] py-14 sm:py-20">
        <Container>
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--primary)] uppercase">Cùng tạo điều phù hợp</p>
          <h1 className="mt-3 max-w-3xl text-[length:var(--text-h1)] font-bold leading-tight tracking-[-0.04em]">Liên hệ hợp tác cùng {siteConfig.creatorName}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">Chia sẻ mục tiêu, thời gian và phạm vi dự án. Một brief rõ ràng sẽ giúp hai bên đánh giá mức độ phù hợp nhanh hơn.</p>
        </Container>
      </header>

      <Container className="pt-12 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start lg:gap-14">
          <aside className="space-y-5 lg:sticky lg:top-24" aria-label="Thông tin liên hệ">
            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <Mail className="text-[var(--primary)]" size={24} aria-hidden="true" />
              <h2 className="mt-4 text-xl font-bold">Email hợp tác</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Kênh ưu tiên dành cho nhãn hàng, đơn vị tổ chức và đối tác truyền thông.</p>
              <a href={`mailto:${siteConfig.contactEmail}`} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] font-semibold text-[var(--primary)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--primary)]">{siteConfig.contactEmail}</a>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <Clock3 className="text-[var(--primary)]" size={24} aria-hidden="true" />
              <h2 className="mt-4 text-xl font-bold">Thời gian phản hồi</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{expectedResponseTime}. Các brief đầy đủ thông tin thường được phản hồi sớm hơn.</p>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <FileText className="text-[var(--primary)]" size={24} aria-hidden="true" />
              <h2 className="mt-4 text-xl font-bold">Media Kit</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Media Kit đang được hoàn thiện và sẽ chỉ cung cấp qua kênh liên hệ chính thức.</p>
              <span className="mt-4 inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">Placeholder · chưa có file tải</span>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <MessageCircle className="text-[var(--primary)]" size={24} aria-hidden="true" />
              <h2 className="mt-4 text-xl font-bold">Mạng xã hội</h2>
              <ul className="mt-4 space-y-2">
                {socialLinks.map((link) => (
                  <li key={link.id}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] px-2 text-sm outline-none transition hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]">
                      <SocialIcon platform={link.platform} size={18} />
                      <span className="min-w-0 flex-1"><strong className="block">{link.label}</strong>{link.followerCount ? <small className="text-[var(--text-muted)]">{formatViewCount(link.followerCount)} người theo dõi</small> : null}</span>
                      <ExternalLink size={15} className="text-[var(--text-muted)]" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-8">
            <ContactForm />
          </div>
        </div>
      </Container>
    </div>
  );
}
