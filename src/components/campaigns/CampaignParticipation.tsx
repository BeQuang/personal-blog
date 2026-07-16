"use client";

import { useCallback, useState } from "react";

import { CampaignRegistrationForm } from "@/components/campaigns/CampaignRegistrationForm";
import { Countdown } from "@/components/home/Countdown";
import type { CampaignStatus } from "@/types";

interface CampaignParticipationProps {
  title: string;
  status: CampaignStatus;
  startAt: string;
  endAt: string;
}

export function CampaignParticipation({
  title,
  status,
  startAt,
  endAt,
}: CampaignParticipationProps) {
  const [expired, setExpired] = useState(false);
  const isUpcoming = status === "upcoming";
  const countdownTarget = isUpcoming ? startAt : endAt;
  const registrationDisabled = status === "ended" || (status === "active" && expired);
  const handleExpired = useCallback(() => setExpired(true), []);

  return (
    <div className="space-y-14 sm:space-y-16">
      <section aria-labelledby="campaign-countdown-title">
        <p className="text-xs font-bold tracking-[0.16em] text-[var(--primary)] uppercase">
          Mốc thời gian
        </p>
        <h2 id="campaign-countdown-title" className="mt-2 text-3xl font-bold tracking-[-0.03em]">
          {isUpcoming ? "Chiến dịch bắt đầu sau" : "Thời gian còn lại"}
        </h2>
        <div className="mt-5 max-w-xl">
          <Countdown
            endAt={countdownTarget}
            onExpired={handleExpired}
            ariaLabel={isUpcoming ? "Thời gian đến khi chiến dịch bắt đầu" : "Thời gian đến khi chiến dịch kết thúc"}
            expiredMessage={
              isUpcoming
                ? "Chiến dịch đã đến thời điểm bắt đầu."
                : "Chiến dịch đã kết thúc. Cảm ơn bạn đã quan tâm!"
            }
          />
        </div>
      </section>

      <CampaignRegistrationForm campaignTitle={title} disabled={registrationDisabled} />
    </div>
  );
}
