import "server-only";

import { and, asc, count, desc, eq, inArray, isNull, ne, sql } from "drizzle-orm";

import { database } from "@/server/database/client";
import { auditLogs, events } from "@/server/database/schema";
import type { AdminEventListQuery } from "@/types";

export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
export type EventUpdate = Partial<Omit<NewEventRow, "id" | "createdAt">>;
const eventRelations = { bannerMedia: true } as const;

export function findPublishedEvents() {
  return database.query.events.findMany({
    orderBy: [desc(events.startAt)],
    where: and(eq(events.contentStatus, "published"), isNull(events.deletedAt)),
    with: eventRelations,
  });
}

export function findEvents() {
  return database.query.events.findMany({
    orderBy: [desc(events.createdAt)],
    where: isNull(events.deletedAt),
    with: eventRelations,
  });
}

export async function findEventPage(query: AdminEventListQuery) {
  const offset = (query.page - 1) * query.pageSize;
  const where = isNull(events.deletedAt);
  const sortColumn = {
    contentStatus: events.contentStatus,
    createdAt: events.createdAt,
    startAt: events.startAt,
    title: events.title,
    updatedAt: events.updatedAt,
  }[query.sortBy];
  const direction = query.sortOrder === "asc" ? asc : desc;
  const [items, totals] = await Promise.all([
    database.query.events.findMany({
      limit: query.pageSize,
      offset,
      orderBy: [direction(sortColumn), desc(events.createdAt), asc(events.id)],
      where,
      with: eventRelations,
    }),
    database.select({ value: count() }).from(events).where(where),
  ]);
  return { items, total: totals[0]?.value ?? 0 };
}

export async function findEventById(id: string) {
  return database.query.events.findFirst({
    where: and(eq(events.id, id), isNull(events.deletedAt)),
    with: eventRelations,
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
    with: eventRelations,
  });
}

export async function findEventBySlug(slug: string, publishedOnly = false) {
  return database.query.events.findFirst({
    where: and(
      sql`lower(${events.slug}) = ${slug.toLowerCase()}`,
      isNull(events.deletedAt),
      publishedOnly ? eq(events.contentStatus, "published") : undefined,
    ),
    with: eventRelations,
  });
}

export async function findConflictingEventSlug(slug: string, excludedId?: string) {
  const [row] = await database.select({ id: events.id }).from(events).where(and(
    sql`lower(${events.slug}) = ${slug.toLowerCase()}`,
    excludedId ? ne(events.id, excludedId) : undefined,
  )).limit(1);
  return row ?? null;
}

export async function createEvent(values: NewEventRow, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [row] = await transaction.insert(events).values(values).returning();
    await transaction.insert(auditLogs).values({ actorProfileId, action: "event.create", entityType: "event", entityId: row.id, afterData: { slug: row.slug, contentStatus: row.contentStatus } });
    return row;
  });
}

export async function updateEvent(id: string, values: EventUpdate, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction.select().from(events).where(and(eq(events.id, id), isNull(events.deletedAt))).limit(1);
    if (!before) return null;
    const [row] = await transaction.update(events).set({ ...values, updatedAt: new Date() }).where(and(eq(events.id, id), isNull(events.deletedAt))).returning();
    await transaction.insert(auditLogs).values({ actorProfileId, action: "event.update", entityType: "event", entityId: id, beforeData: { slug: before.slug, contentStatus: before.contentStatus }, afterData: { slug: row.slug, contentStatus: row.contentStatus } });
    return row;
  });
}

export async function archiveEvent(id: string, actorProfileId: string) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction.select().from(events).where(and(eq(events.id, id), isNull(events.deletedAt))).limit(1);
    if (!before) return null;
    const [row] = await transaction.update(events).set({ contentStatus: "archived", updatedAt: new Date() }).where(eq(events.id, id)).returning();
    await transaction.insert(auditLogs).values({ actorProfileId, action: "event.archive", entityType: "event", entityId: id, beforeData: { contentStatus: before.contentStatus }, afterData: { contentStatus: row.contentStatus } });
    return row;
  });
}

export async function insertEventIfMissing(values: NewEventRow) {
  const existing = await findEventBySlug(values.slug);
  if (existing) return { operation: "skipped" as const, row: existing };

  const [row] = await database.insert(events).values(values).returning();
  return { operation: "inserted" as const, row };
}
