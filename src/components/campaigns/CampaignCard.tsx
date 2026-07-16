import { ArrowRight, CalendarDays } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { campaignStatusLabels } from "@/config/campaign.config";
import type { Campaign, CampaignStatus } from "@/types";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/date";

const statusClasses: Record<CampaignStatus, string> = {
  draft: "bg-[var(--surface-hover)] text-[var(--text-muted)]",
  upcoming: "bg-[var(--primary-soft)] text-[var(--primary)]",
  active: "bg-[color-mix(in_srgb,var(--success)_13%,transparent)] text-[var(--success)]",
  ended: "bg-[var(--surface-hover)] text-[var(--text-secondary)]",
};

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const href = `/campaigns/${campaign.slug}`;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] transition duration-200 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-card)]">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-[16/10] overflow-hidden bg-[var(--surface-elevated)]"
      >
        <Image
          src={campaign.banner}
          alt=""
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <span
          className={cn(
            "absolute top-4 left-4 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur-md",
            statusClasses[campaign.status],
          )}
        >
          {campaignStatusLabels[campaign.status]}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
          <CalendarDays size={15} aria-hidden="true" />
          <time dateTime={campaign.startAt}>{formatDate(campaign.startAt)}</time>
          <span aria-hidden="true">–</span>
          <time dateTime={campaign.endAt}>{formatDate(campaign.endAt)}</time>
        </div>
        <h3 className="mt-3 text-xl font-bold leading-8 tracking-[-0.025em]">
          <Link
            href={href}
            className="rounded-sm outline-none focus-visible:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {campaign.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--text-secondary)]">
          {campaign.description}
        </p>
        <Link
          href={href}
          className="mt-auto inline-flex min-h-11 w-fit items-center gap-2 pt-5 font-bold text-[var(--primary)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          Xem chiến dịch <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
