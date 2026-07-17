import "server-only";

import { and, desc, isNull, ne, sql } from "drizzle-orm";

import { database } from "@/server/database/client";
import { campaigns } from "@/server/database/schema";

export type CampaignRow = typeof campaigns.$inferSelect;
export type NewCampaignRow = typeof campaigns.$inferInsert;

export function findPublicCampaigns() {
  return database.query.campaigns.findMany({
    orderBy: [desc(campaigns.startAt)],
    where: and(ne(campaigns.status, "draft"), isNull(campaigns.deletedAt)),
    with: { bannerMedia: true },
  });
}

export function findCampaigns() {
  return database.query.campaigns.findMany({
    orderBy: [desc(campaigns.startAt)],
    where: isNull(campaigns.deletedAt),
    with: { bannerMedia: true },
  });
}

export async function findCampaignBySlug(slug: string, publicOnly = false) {
  return database.query.campaigns.findFirst({
    where: and(
      sql`lower(${campaigns.slug}) = ${slug.toLowerCase()}`,
      isNull(campaigns.deletedAt),
      publicOnly ? ne(campaigns.status, "draft") : undefined,
    ),
    with: { bannerMedia: true },
  });
}

export async function insertCampaignIfMissing(values: NewCampaignRow) {
  const existing = await findCampaignBySlug(values.slug);
  if (existing) return { operation: "skipped" as const, row: existing };

  const [row] = await database.insert(campaigns).values(values).returning();
  return { operation: "inserted" as const, row };
}
