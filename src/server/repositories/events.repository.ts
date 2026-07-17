import "server-only";

import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";

import { database } from "@/server/database/client";
import { events } from "@/server/database/schema";

export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;

export function findPublishedEvents() {
  return database.query.events.findMany({
    orderBy: [desc(events.startAt)],
    where: and(eq(events.contentStatus, "published"), isNull(events.deletedAt)),
    with: { bannerMedia: true },
  });
}

export function findUpcomingEvents(referenceDate = new Date()) {
  return database.query.events.findMany({
    orderBy: [asc(events.startAt)],
    where: and(
      eq(events.contentStatus, "published"),
      inArray(events.eventStatus, ["upcoming", "live"]),
      sql`coalesce(${events.endAt}, ${events.startAt}) > ${referenceDate}`,
      isNull(events.deletedAt),
    ),
    with: { bannerMedia: true },
  });
}

export async function findEventBySlug(slug: string, publishedOnly = false) {
  return database.query.events.findFirst({
    where: and(
      sql`lower(${events.slug}) = ${slug.toLowerCase()}`,
      isNull(events.deletedAt),
      publishedOnly ? eq(events.contentStatus, "published") : undefined,
    ),
    with: { bannerMedia: true },
  });
}

export async function insertEventIfMissing(values: NewEventRow) {
  const existing = await findEventBySlug(values.slug);
  if (existing) return { operation: "skipped" as const, row: existing };

  const [row] = await database.insert(events).values(values).returning();
  return { operation: "inserted" as const, row };
}
