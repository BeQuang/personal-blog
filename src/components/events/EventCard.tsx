import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { eventStatusLabels, eventTypeLabels } from "@/config/event.config";
import type { EventItem, EventStatus } from "@/types";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/date";

const statusClasses: Record<EventStatus, string> = {
  upcoming: "bg-[var(--primary-soft)] text-[var(--primary)]",
  live: "bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] text-[var(--danger)]",
  ended: "bg-[var(--surface-hover)] text-[var(--text-secondary)]",
  cancelled: "bg-[color-mix(in_srgb,var(--warning)_13%,transparent)] text-[var(--warning)]",
};

interface EventCardProps {
  event: EventItem;
}

export function EventCard({ event }: EventCardProps) {
  const href = `/events/${event.slug}`;
  const venue = event.location ?? event.platform ?? "Trực tuyến";

  return (
    <article className="group grid min-w-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-card)] md:grid-cols-[240px_minmax(0,1fr)]">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block min-h-52 overflow-hidden bg-[var(--surface-elevated)] md:min-h-full"
      >
        <Image
          src={event.banner}
          alt=""
          fill
          sizes="(max-width: 767px) 100vw, 240px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </Link>

      <div className="flex min-w-0 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)]">
            {eventTypeLabels[event.type]}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-bold",
              statusClasses[event.status],
            )}
          >
            {eventStatusLabels[event.status]}
          </span>
        </div>

        <h3 className="mt-4 text-xl font-bold leading-8 tracking-[-0.025em] text-[var(--text-primary)]">
          <Link
            href={href}
            className="rounded-sm outline-none focus-visible:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {event.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
          {event.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--text-muted)]">
          <time dateTime={event.startAt} className="inline-flex items-center gap-2">
            <CalendarDays size={16} aria-hidden="true" /> {formatDateTime(event.startAt)}
          </time>
          <span className="inline-flex min-w-0 items-center gap-2">
            <MapPin className="shrink-0" size={16} aria-hidden="true" />
            <span className="truncate">{venue}</span>
          </span>
        </div>

        <Link
          href={href}
          className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-[var(--radius-md)] font-bold text-[var(--primary)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          Xem chi tiết <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
