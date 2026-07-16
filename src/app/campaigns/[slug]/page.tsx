import { ArrowLeft, CalendarDays, CheckCircle2, FileText } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { CampaignParticipation } from "@/components/campaigns/CampaignParticipation";
import { LinkButton } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { campaignStatusLabels } from "@/config/campaign.config";
import { withSocialMetadata } from "@/lib/metadata";
import {
  getEffectiveCampaignStatus,
  getPublicCampaignBySlug,
  getPublicCampaigns,
} from "@/services/campaign.service";
import { formatDateTime } from "@/utils/date";

interface CampaignPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPublicCampaigns().map((campaign) => ({ slug: campaign.slug }));
}

export async function generateMetadata({
  params,
}: CampaignPageProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = getPublicCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const canonical = `/campaigns/${campaign.slug}`;
  return withSocialMetadata({
    title: campaign.title,
    description: campaign.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: campaign.title,
      description: campaign.description,
      url: canonical,
      images: [{ url: campaign.banner, alt: `Banner chiến dịch ${campaign.title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: campaign.title,
      description: campaign.description,
      images: [campaign.banner],
    },
  });
}

export default async function CampaignDetailPage({ params }: CampaignPageProps) {
  await connection();
  const { slug } = await params;
  const campaign = getPublicCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const effectiveStatus = getEffectiveCampaignStatus(campaign);
  const isEnded = effectiveStatus === "ended";

  return (
    <article className="pb-20 sm:pb-24">
      <header className="border-b border-[var(--border)] bg-[var(--background-secondary)] py-8 sm:py-12">
        <Container>
          <nav aria-label="Breadcrumb" className="text-sm text-[var(--text-muted)]">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-[var(--primary)]">Trang chủ</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/campaigns" className="hover:text-[var(--primary)]">Chiến dịch</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="max-w-64 truncate text-[var(--text-secondary)]">
                {campaign.title}
              </li>
            </ol>
          </nav>

          <span className="mt-8 inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
            {campaignStatusLabels[effectiveStatus]}
          </span>
          <h1 className="mt-4 max-w-4xl text-[length:var(--text-h1)] font-bold leading-[1.14] tracking-[-0.045em]">
            {campaign.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--text-secondary)]">
            {campaign.description}
          </p>
        </Container>
      </header>

      <Container className="pt-8 sm:pt-12">
        <div className="relative aspect-[16/8] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)] max-sm:aspect-[4/3]">
          <Image
            src={campaign.banner}
            alt={`Banner chiến dịch ${campaign.title}`}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] uppercase">
              <CalendarDays size={16} aria-hidden="true" /> Bắt đầu
            </p>
            <time dateTime={campaign.startAt} className="mt-2 block font-semibold">
              {formatDateTime(campaign.startAt)}
            </time>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] uppercase">
              <CalendarDays size={16} aria-hidden="true" /> Kết thúc
            </p>
            <time dateTime={campaign.endAt} className="mt-2 block font-semibold">
              {formatDateTime(campaign.endAt)}
            </time>
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <section aria-labelledby="campaign-rules-title">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <CheckCircle2 size={23} aria-hidden="true" />
            </div>
            <h2 id="campaign-rules-title" className="mt-4 text-3xl font-bold tracking-[-0.03em]">
              Cách tham gia
            </h2>
            <ol className="mt-5 space-y-3">
              {campaign.rules.map((rule, index) => (
                <li
                  key={`${rule}-${index}`}
                  className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--text-secondary)]"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)]">
                    {index + 1}
                  </span>
                  {rule}
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="campaign-terms-title">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <FileText size={23} aria-hidden="true" />
            </div>
            <h2 id="campaign-terms-title" className="mt-4 text-3xl font-bold tracking-[-0.03em]">
              Điều khoản
            </h2>
            <ul className="mt-5 space-y-3">
              {campaign.terms.map((term, index) => (
                <li
                  key={`${term}-${index}`}
                  className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--text-secondary)]"
                >
                  {term}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-14 border-t border-[var(--border)] pt-12">
          <CampaignParticipation
            title={campaign.title}
            status={effectiveStatus}
            startAt={campaign.startAt}
            endAt={campaign.endAt}
          />
        </div>

        <aside className="mt-14 rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_16%,var(--surface)),color-mix(in_srgb,var(--secondary)_10%,var(--surface)))] p-7 text-center sm:p-10">
          <h2 className="text-2xl font-bold tracking-[-0.03em]">
            {isEnded ? "Khám phá chiến dịch khác" : "Sẵn sàng tham gia?"}
          </h2>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-[var(--text-secondary)]">
            {isEnded
              ? "Chiến dịch này đã kết thúc, nhưng vẫn còn nhiều hoạt động khác để bạn khám phá."
              : "Đọc kỹ thể lệ rồi gửi biểu mẫu mock để hoàn tất trải nghiệm đăng ký."}
          </p>
          {isEnded ? (
            <LinkButton href="/campaigns" size="lg" variant="outline" className="mt-6">
              <ArrowLeft size={18} aria-hidden="true" /> Xem các chiến dịch
            </LinkButton>
          ) : (
            <a
              href="#registration"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-[var(--radius-lg)] bg-[linear-gradient(135deg,var(--action-primary),var(--action-secondary))] px-5 font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
            >
              Đi đến biểu mẫu
            </a>
          )}
        </aside>
      </Container>
    </article>
  );
}
