import { ArrowLeft, ArrowUpRight, CalendarDays, Clock3, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LinkButton } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { EventShareButtons } from "@/components/events/EventShareButtons";
import { eventStatusLabels, eventTypeLabels } from "@/config/event.config";
import { siteConfig } from "@/config/site.config";
import { withSocialMetadata } from "@/lib/metadata";
import { getEventBySlug, getEvents } from "@/services/event.service";
import { formatDate, formatTime } from "@/utils/date";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getEvents().map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const canonical = `/events/${event.slug}`;
  return withSocialMetadata({
    title: event.title,
    description: event.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: event.title,
      description: event.description,
      url: canonical,
      images: [{ url: event.banner, alt: `Banner sự kiện ${event.title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description,
      images: [event.banner],
    },
  });
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const venue = event.location ?? event.platform ?? "Trực tuyến";
  const canonicalUrl = new URL(`/events/${event.slug}`, siteConfig.siteUrl).toString();
  const canJoin =
    event.externalUrl && event.status !== "ended" && event.status !== "cancelled";

  return (
    <article className="pb-20 sm:pb-24">
      <header className="border-b border-[var(--border)] bg-[var(--background-secondary)] py-8 sm:py-12">
        <Container>
          <nav aria-label="Breadcrumb" className="text-sm text-[var(--text-muted)]">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-[var(--primary)]">Trang chủ</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/events" className="hover:text-[var(--primary)]">Sự kiện</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="max-w-64 truncate text-[var(--text-secondary)]">
                {event.title}
              </li>
            </ol>
          </nav>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
              {eventTypeLabels[event.type]}
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)]">
              {eventStatusLabels[event.status]}
            </span>
          </div>
          <h1 className="mt-4 max-w-4xl text-[length:var(--text-h1)] font-bold leading-[1.14] tracking-[-0.045em]">
            {event.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--text-secondary)]">
            {event.description}
          </p>
        </Container>
      </header>

      <Container className="pt-8 sm:pt-12">
        <div className="relative aspect-[16/8] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)] max-sm:aspect-[4/3]">
          <Image
            src={event.banner}
            alt={`Banner sự kiện ${event.title}`}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-10">
            <section aria-labelledby="event-information-title">
              <h2 id="event-information-title" className="text-2xl font-bold tracking-[-0.03em]">
                Thông tin sự kiện
              </h2>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
                  <dt className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] uppercase">
                    <CalendarDays size={16} aria-hidden="true" /> Ngày bắt đầu
                  </dt>
                  <dd className="mt-2 font-semibold">{formatDate(event.startAt)}</dd>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
                  <dt className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] uppercase">
                    <Clock3 size={16} aria-hidden="true" /> Thời gian
                  </dt>
                  <dd className="mt-2 font-semibold">{formatTime(event.startAt)}</dd>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:col-span-2">
                  <dt className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] uppercase">
                    <MapPin size={16} aria-hidden="true" /> Địa điểm hoặc nền tảng
                  </dt>
                  <dd className="mt-2 font-semibold">{venue}</dd>
                </div>
              </dl>
            </section>

            {event.schedule && event.schedule.length > 0 ? (
              <section aria-labelledby="event-schedule-title">
                <h2 id="event-schedule-title" className="text-2xl font-bold tracking-[-0.03em]">
                  Lịch trình
                </h2>
                <ol className="mt-5 space-y-3">
                  {event.schedule.map((item) => (
                    <li
                      key={`${item.time}-${item.title}`}
                      className="grid gap-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:grid-cols-[88px_minmax(0,1fr)] sm:items-center"
                    >
                      <time className="font-bold text-[var(--primary)]">{item.time}</time>
                      <span className="font-semibold text-[var(--text-primary)]">{item.title}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            <EventShareButtons title={event.title} url={canonicalUrl} />
          </div>

          <aside className="rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface)] p-6 lg:sticky lg:top-24">
            <p className="text-xs font-bold tracking-[0.14em] text-[var(--primary)] uppercase">
              {eventStatusLabels[event.status]}
            </p>
            <h2 className="mt-3 text-xl font-bold">Bạn muốn tham gia?</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {canJoin
                ? "Mở trang sự kiện chính thức để xem thông tin mới nhất và tham gia."
                : "Sự kiện hiện không nhận đăng ký. Bạn có thể xem các hoạt động khác trong lịch."}
            </p>
            {canJoin ? (
              <a
                href={event.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[linear-gradient(135deg,var(--action-primary),var(--action-secondary))] px-5 font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                Mở trang sự kiện <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            ) : (
              <LinkButton href="/events" size="lg" variant="outline" className="mt-5 w-full">
                <ArrowLeft size={18} aria-hidden="true" /> Xem sự kiện khác
              </LinkButton>
            )}
          </aside>
        </div>
      </Container>
    </article>
  );
}
