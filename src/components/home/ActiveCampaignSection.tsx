"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";

import { Container } from "@/components/common/Container";
import { AnalyticsLink } from "@/components/home/AnalyticsLink";
import { Countdown } from "@/components/home/Countdown";
import { homepageConfig } from "@/config/homepage.config";
import type { Campaign } from "@/types";
import { cn } from "@/utils/cn";

interface ActiveCampaignSectionProps {
  campaign: Campaign;
}

export function ActiveCampaignSection({ campaign }: ActiveCampaignSectionProps) {
  const [expired, setExpired] = useState(false);
  const config = homepageConfig.campaign;
  const handleExpired = useCallback(() => setExpired(true), []);

  return (
    <section className="home-section home-section-soft" aria-labelledby="campaign-title">
      <Container>
        <article className="campaign-card">
          <div className="campaign-image">
            <Image
              src={campaign.banner}
              alt=""
              fill
              sizes="(max-width: 1023px) 100vw, 44vw"
              className="object-cover"
            />
            <span className="campaign-image-shade" />
            <span
              className={cn("campaign-status", expired && "campaign-status-ended")}
            >
              {expired ? "Đã kết thúc" : "Đang hoạt động"}
            </span>
          </div>
          <div className="campaign-copy">
            <p className="section-eyebrow">{config.eyebrow}</p>
            <h2 id="campaign-title">{config.title}</h2>
            <h3>{campaign.title}</h3>
            <p>{campaign.description}</p>
            <ul>
              {campaign.rules.slice(0, 3).map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <Countdown endAt={campaign.endAt} onExpired={handleExpired} />
            {expired ? null : (
              <AnalyticsLink
                href={campaign.buttonUrl ?? `/campaigns/${campaign.slug}`}
                analytics={{ type: "campaign", id: campaign.id }}
                className="campaign-button"
              >
                {campaign.buttonLabel}
                <ArrowRight size={18} aria-hidden="true" />
              </AnalyticsLink>
            )}
          </div>
        </article>
      </Container>
    </section>
  );
}
