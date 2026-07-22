"use client";

import { useEffect } from "react";

import { trackCampaignView, trackPostView } from "@/lib/analytics";

interface AnalyticsViewProps {
  type: "post" | "campaign";
  entityId: string;
}

export function AnalyticsView({ type, entityId }: AnalyticsViewProps) {
  useEffect(() => {
    if (type === "post") trackPostView(entityId);
    else trackCampaignView(entityId);
  }, [entityId, type]);

  return null;
}

