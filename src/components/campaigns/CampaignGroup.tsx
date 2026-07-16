import { EmptyState } from "@/components/common/EmptyState";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import type { Campaign } from "@/types";

interface CampaignGroupProps {
  titleId: string;
  title: string;
  description: string;
  campaigns: readonly Campaign[];
  emptyMessage: string;
}

export function CampaignGroup({
  titleId,
  title,
  description,
  campaigns,
  emptyMessage,
}: CampaignGroupProps) {
  return (
    <section aria-labelledby={titleId}>
      <div>
        <h2
          id={titleId}
          className="text-[length:var(--text-h2)] font-bold tracking-[-0.03em]"
        >
          {title}
        </h2>
        <p className="mt-2 max-w-2xl leading-7 text-[var(--text-secondary)]">{description}</p>
      </div>
      {campaigns.length > 0 ? (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard campaign={campaign} key={campaign.id} />
          ))}
        </div>
      ) : (
        <EmptyState className="mt-7" title={emptyMessage} />
      )}
    </section>
  );
}
