import "server-only";

import { desc } from "drizzle-orm";

import { database } from "@/server/database/client";
import {
  campaignSubmissions,
  contactSubmissions,
  newsletterSubscriptions,
} from "@/server/database/schema";

function normalizeLimit(limit: number) {
  return Math.min(200, Math.max(1, Math.trunc(limit)));
}

export function findCampaignSubmissions(limit = 50) {
  return database
    .select()
    .from(campaignSubmissions)
    .orderBy(desc(campaignSubmissions.createdAt))
    .limit(normalizeLimit(limit));
}

export function findContactSubmissions(limit = 50) {
  return database
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(normalizeLimit(limit));
}

export function findNewsletterSubscriptions(limit = 50) {
  return database
    .select()
    .from(newsletterSubscriptions)
    .orderBy(desc(newsletterSubscriptions.createdAt))
    .limit(normalizeLimit(limit));
}
