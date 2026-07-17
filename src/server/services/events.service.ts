import "server-only";

import { z } from "zod";

import { events as mockEvents } from "@/data/events";
import { NotFoundError, ValidationError } from "@/server/errors";
import { mapEventRowToEventItem } from "@/server/mappers/events.mapper";

import { getContentSource } from "./content-source";
import {
  assertDateRange,
  createSlug,
  executeRepository,
  parseSlug,
  slugSchema,
} from "./service-helpers";

const eventMutationSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: slugSchema.optional(),
  description: z.string().trim().min(10).max(2_000),
  type: z.enum(["livestream", "premiere", "fan-meeting", "giveaway", "workshop", "offline", "launch"]),
  eventStatus: z.enum(["upcoming", "live", "ended", "cancelled"]),
  contentStatus: z.enum(["draft", "scheduled", "published", "archived"]),
  startAt: z.coerce.date(),
  endAt: z.coerce.date().nullable().optional(),
  location: z.string().trim().max(300).optional(),
  platform: z.string().trim().max(100).optional(),
  externalUrl: z.url().optional(),
});

export async function getEvents() {
  if (getContentSource() === "mock") {
    return mockEvents
      .map((event) => ({ ...event }))
      .sort(
        (left, right) =>
          new Date(right.startAt).getTime() - new Date(left.startAt).getTime(),
      );
  }

  const { findPublishedEvents } = await import("@/server/repositories/events.repository");
  return executeRepository(async () => (await findPublishedEvents()).map(mapEventRowToEventItem));
}

export async function getUpcomingEvents(referenceDate: string | Date = new Date()) {
  const reference = new Date(referenceDate);
  if (Number.isNaN(reference.getTime())) {
    throw new ValidationError("Reference date is invalid", {
      referenceDate: ["Reference date must be a valid date"],
    });
  }
  return (await getEvents())
    .filter(
      (event) =>
        (event.status === "upcoming" || event.status === "live") &&
        new Date(event.endAt ?? event.startAt) > reference,
    )
    .sort(
      (left, right) =>
        new Date(left.startAt).getTime() - new Date(right.startAt).getTime(),
    );
}

export async function getEventsByStatus(status: (typeof mockEvents)[number]["status"]) {
  return (await getEvents()).filter((event) => event.status === status);
}

export async function getEventsByType(type: (typeof mockEvents)[number]["type"]) {
  return (await getEvents()).filter((event) => event.type === type);
}

export async function getEventBySlug(slug: string) {
  const normalizedSlug = parseSlug(slug);
  if (getContentSource() === "mock") return mockEvents.find((event) => event.slug === normalizedSlug);

  const { findEventBySlug } = await import("@/server/repositories/events.repository");
  return executeRepository(async () => {
    const row = await findEventBySlug(normalizedSlug, true);
    return row ? mapEventRowToEventItem(row) : undefined;
  });
}

export async function requireEventBySlug(slug: string) {
  const event = await getEventBySlug(slug);
  if (!event) throw new NotFoundError("Event", slug);
  return event;
}

export async function prepareEventMutation(input: unknown) {
  const parsed = eventMutationSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Event validation failed", parsed.error.flatten().fieldErrors);
  }
  assertDateRange(parsed.data.startAt, parsed.data.endAt);
  const now = new Date();
  if (parsed.data.eventStatus === "upcoming" && parsed.data.startAt <= now) {
    throw new ValidationError("Upcoming events require a future start time", {
      startAt: ["Start time must be in the future"],
    });
  }
  if (parsed.data.eventStatus === "live" && (parsed.data.startAt > now || (parsed.data.endAt && parsed.data.endAt <= now))) {
    throw new ValidationError("Live event times do not include the current time");
  }
  if (parsed.data.eventStatus === "ended" && (!parsed.data.endAt || parsed.data.endAt > now)) {
    throw new ValidationError("Ended events require an end time in the past", {
      endAt: ["End time must be in the past"],
    });
  }
  if (parsed.data.contentStatus === "scheduled" && parsed.data.startAt <= now) {
    throw new ValidationError("Scheduled events require a future start time");
  }
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission(
    parsed.data.contentStatus === "published" || parsed.data.contentStatus === "scheduled"
      ? "content:publish"
      : "content:write",
  );
  return { ...parsed.data, slug: parsed.data.slug ?? createSlug(parsed.data.title) };
}
