import type { EventItem } from "@/types";

import type { findPublishedEvents } from "@/server/repositories/events.repository";

import { requirePublicMediaUrl } from "./mapper-helpers";

type EventWithMedia = Awaited<ReturnType<typeof findPublishedEvents>>[number];

export function mapEventRowToEventItem(row: EventWithMedia): EventItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    banner: requirePublicMediaUrl(row.bannerMedia, `Event '${row.slug}' banner`),
    type: row.type,
    status: row.eventStatus,
    startAt: row.startAt.toISOString(),
    ...(row.endAt ? { endAt: row.endAt.toISOString() } : {}),
    ...(row.location ? { location: row.location } : {}),
    ...(row.platform ? { platform: row.platform } : {}),
    ...(row.externalUrl ? { externalUrl: row.externalUrl } : {}),
    ...(row.schedule.length > 0 ? { schedule: row.schedule } : {}),
    featured: row.featured,
  };
}
