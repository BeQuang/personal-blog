import { events } from "@/data/events";
import type { EventItem, EventStatus, EventType } from "@/types";
import {
  findBySlug,
  sortByDateAscending,
  sortByDateDescending,
} from "@/utils/data";

export function getEvents(): EventItem[] {
  return sortByDateDescending(events, (event) => event.startAt);
}

export function getUpcomingEvents(): EventItem[] {
  return sortByDateAscending(
    events.filter(
      (event) => event.status === "upcoming" || event.status === "live",
    ),
    (event) => event.startAt,
  );
}

export function getEventBySlug(slug: string): EventItem | undefined {
  return findBySlug(events, slug);
}

export function getEventsByStatus(status: EventStatus): EventItem[] {
  return getEvents().filter((event) => event.status === status);
}

export function getEventsByType(type: EventType): EventItem[] {
  return getEvents().filter((event) => event.type === type);
}
