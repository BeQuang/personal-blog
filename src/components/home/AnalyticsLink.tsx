"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";

import {
  trackCampaignClick,
  trackSocialClick,
  trackVideoClick,
} from "@/lib/analytics";

type AnalyticsTarget =
  | { type: "social"; id: string }
  | { type: "video"; id: string }
  | { type: "campaign"; id: string };

interface AnalyticsLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  href: string;
  analytics: AnalyticsTarget;
}

export function AnalyticsLink({
  analytics,
  children,
  onClick,
  ...props
}: AnalyticsLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        if (analytics.type === "social") {
          trackSocialClick(analytics.id);
        } else if (analytics.type === "video") {
          trackVideoClick(analytics.id);
        } else {
          trackCampaignClick(analytics.id);
        }

        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
