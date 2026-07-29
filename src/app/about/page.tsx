import {
  ArrowRight,
  Award,
  BookOpenText,
  ExternalLink,
  Handshake,
  HeartHandshake,
  Lightbulb,
  PlayCircle,
  Sparkles,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { LinkButton } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { SectionHeader } from "@/components/common/SectionHeader";
import { SocialIcon } from "@/components/common/SocialIcon";
import { AnalyticsLink } from "@/components/home/AnalyticsLink";
import { homepageConfig } from "@/config/homepage.config";
import { siteConfig } from "@/config/site.config";
import { withSocialMetadata } from "@/lib/metadata";
import { getEnabledSocialLinks } from "@/services/social.service";
import { formatViewCount } from "@/utils/format";

export const metadata: Metadata = withSocialMetadata({
  title: "Giới thiệu",
  description:
    "Tìm hiểu hành trình sáng tạo nội dung, chủ đề, giá trị và những cột mốc của Quang Official.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: `Giới thiệu | ${siteConfig.siteName}`,
    description: "Hành trình sáng tạo nội dung và xây dựng cộng đồng của Quang.",
    url: "/about",
    images: [{ url: siteConfig.coverImage, alt: `Giới thiệu ${siteConfig.creatorName}` }],
  },
});

const achievements = [
  { value: "250K+", label: "Người theo dõi", icon: Users },
  { value: "30M+", label: "Lượt xem nội dung", icon: PlayCircle },
  { value: "120+", label: "Video đã xuất bản", icon: Award },
] as const;

const timeline = [
  { year: "2023", title: "Bắt đầu tạo nội dung", description: "Thử nghiệm những video đầu tiên và học cách kể một câu chuyện ngắn gọn." },
  { year: "2024", title: "Đạt 100.000 lượt theo dõi", description: "Xây dựng nhịp đăng đều đặn và gặp những thành viên đầu tiên của cộng đồng." },
  { year: "2025", title: "Mở rộng nội dung trên YouTube", description: "Phát triển vlog, video dài và các nội dung chia sẻ sâu hơn." },
  { year: "2026", title: "Xây dựng cộng đồng fan riêng", description: "Kết nối bài viết, sự kiện và chiến dịch trong một không gian chung." },
] as const;

const values = [
  { title: "Chân thành trước ống kính", description: "Chia sẻ trải nghiệm thật, nói rõ điều mình biết và sẵn sàng thừa nhận điều còn đang học.", icon: HeartHandshake },
  { title: "Hữu ích nhưng dễ tiếp cận", description: "Biến kinh nghiệm và công cụ thành hướng dẫn rõ ràng để người mới cũng có thể bắt đầu.", icon: Lightbulb },
  { title: "Phát triển cùng cộng đồng", description: "Lắng nghe phản hồi, tôn trọng khác biệt và tạo ra những hoạt động có giá trị lâu dài.", icon: Sparkles },
] as const;

export default async function AboutPage() {
  const socialLinks = await getEnabledSocialLinks();
  const socialStats = socialLinks.filter((link) => link.followerCount !== undefined);
  const followLink = socialLinks.find((link) => link.platform === "youtube") ?? socialLinks[0];

  return (
    <div className="pb-20 sm:pb-24">
      <header className="border-b border-[var(--border)] bg-[var(--background-secondary)] py-12 sm:py-16 lg:py-20">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:gap-16">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-[var(--primary)] uppercase">Câu chuyện phía sau nội dung</p>
            <h1 className="mt-3 max-w-3xl text-[length:var(--text-h1)] font-bold leading-tight tracking-[-0.04em]">
              Xin chào, mình là {siteConfig.creatorName} — một người thích kể chuyện bằng hình ảnh.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Mình bắt đầu từ những video ngắn quay bằng thiết bị đơn giản. Qua từng dự án, điều mình trân trọng nhất không chỉ là con số, mà là một cộng đồng cùng học, cùng thử và cùng tiến bộ.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {followLink ? (
                <AnalyticsLink
                  href={followLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  analytics={{ type: "social", id: followLink.platform }}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[linear-gradient(135deg,var(--action-primary),var(--action-secondary))] px-5 font-semibold text-white shadow-[0_10px_30px_color-mix(in_srgb,var(--primary)_22%,transparent)] outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  Theo dõi trên {followLink.label} <ExternalLink size={18} aria-hidden="true" />
                </AnalyticsLink>
              ) : null}
              <LinkButton href="/contact" variant="outline" size="lg">
                Hợp tác cùng Quang <Handshake size={18} aria-hidden="true" />
              </LinkButton>
            </div>
          </div>

          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
            <Image
              src={siteConfig.avatar}
              alt={`Chân dung ${siteConfig.creatorName}`}
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 440px"
              className="object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20 text-white">
              <strong className="block text-xl">{siteConfig.creatorName}</strong>
              <small className="mt-1 block text-white/75">Creator · Storyteller · Người bạn đồng hành</small>
            </span>
          </div>
        </Container>
      </header>

      <section className="py-14 sm:py-20" aria-labelledby="about-topics-title">
        <Container>
          <SectionHeader
            titleId="about-topics-title"
            eyebrow="Mình chia sẻ gì?"
            title="Nội dung bắt đầu từ trải nghiệm thật"
            description="Mỗi chủ đề là một phần trong hành trình sáng tạo, làm việc và quan sát cuộc sống hằng ngày."
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {homepageConfig.hero.topics.map((topic, index) => (
              <li className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5" key={topic}>
                <span className="grid size-10 place-items-center rounded-xl bg-[var(--primary-soft)] font-bold text-[var(--primary)]">{String(index + 1).padStart(2, "0")}</span>
                <strong className="mt-4 block">{topic}</strong>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--background-secondary)] py-14 sm:py-20" aria-labelledby="about-achievements-title">
        <Container>
          <SectionHeader titleId="about-achievements-title" eyebrow="Những cột mốc" title="Thành tích là dấu vết của một hành trình dài" />
          <dl className="mt-8 grid gap-5 sm:grid-cols-3">
            {achievements.map(({ icon: Icon, label, value }) => (
              <div className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6" key={label}>
                <Icon size={24} className="text-[var(--primary)]" aria-hidden="true" />
                <dt className="order-3 mt-1 text-sm text-[var(--text-muted)]">{label}</dt>
                <dd className="order-2 mt-5 text-3xl font-bold tracking-[-0.04em]">{value}</dd>
              </div>
            ))}
          </dl>

          <div id="social-stats" className="mt-12 scroll-mt-24">
            <h3 className="text-xl font-bold">Cộng đồng trên từng nền tảng</h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {socialStats.map((link) => (
                <li key={link.id}>
                  <AnalyticsLink
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    analytics={{ type: "social", id: link.platform }}
                    className="flex min-h-24 items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 outline-none transition hover:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--primary-soft)] text-[var(--primary)]"><SocialIcon platform={link.platform} /></span>
                    <span className="min-w-0">
                      <strong className="block">{link.label}</strong>
                      <small className="text-[var(--text-muted)]">
                        {formatViewCount(link.followerCount)} người theo dõi
                        {link.platform === "tiktok" && link.likesCount !== undefined
                          ? ` · ${formatViewCount(link.likesCount)} lượt thích`
                          : ""}
                      </small>
                    </span>
                  </AnalyticsLink>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20" aria-labelledby="about-timeline-title">
        <Container>
          <SectionHeader titleId="about-timeline-title" eyebrow="Dòng thời gian" title="Từ video đầu tiên đến một cộng đồng riêng" />
          <ol className="mt-9 grid gap-5 lg:grid-cols-4">
            {timeline.map((item) => (
              <li className="relative rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6" key={item.year}>
                <time className="text-3xl font-bold tracking-[-0.04em] text-[var(--primary)]">{item.year}</time>
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--background-secondary)] py-14 sm:py-20" aria-labelledby="about-values-title">
        <Container>
          <SectionHeader titleId="about-values-title" eyebrow="Điều mình tin" title="Ba giá trị giữ mọi nội dung đi đúng hướng" />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {values.map(({ icon: Icon, title, description }) => (
              <article className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6" key={title}>
                <span className="grid size-12 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]"><Icon size={24} aria-hidden="true" /></span>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-[var(--text-secondary)]">{description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20" aria-labelledby="about-cta-title">
        <Container>
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_17%,var(--surface)),color-mix(in_srgb,var(--secondary)_10%,var(--surface)))] p-7 text-center sm:p-12">
            <BookOpenText className="mx-auto text-[var(--primary)]" size={34} aria-hidden="true" />
            <h2 id="about-cta-title" className="mt-4 text-[length:var(--text-h2)] font-bold tracking-[-0.03em]">Cùng tạo ra một câu chuyện đáng nhớ</h2>
            <p className="mx-auto mt-3 max-w-2xl leading-7 text-[var(--text-secondary)]">Theo dõi nội dung mới hoặc gửi brief nếu bạn đang tìm một hướng hợp tác phù hợp với cộng đồng.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <LinkButton href="/blog" size="lg">Xem bài viết <ArrowRight size={18} aria-hidden="true" /></LinkButton>
              <LinkButton href="/contact" variant="outline" size="lg">Liên hệ hợp tác <Handshake size={18} aria-hidden="true" /></LinkButton>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
