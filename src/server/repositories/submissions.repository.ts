import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  isNull,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { database } from "@/server/database/client";
import {
  auditLogs,
  campaigns,
  campaignSubmissions,
  contactSubmissions,
  newsletterSubscriptions,
} from "@/server/database/schema";

export type NewCampaignSubmission = typeof campaignSubmissions.$inferInsert;
export type NewContactSubmission = typeof contactSubmissions.$inferInsert;
export type NewNewsletterSubscription = typeof newsletterSubscriptions.$inferInsert;
export type SubmissionStatus = typeof campaignSubmissions.$inferSelect.status;
export type NewsletterStatus = typeof newsletterSubscriptions.$inferSelect.status;

export interface SubmissionListQuery<Status extends string> {
  page: number;
  pageSize: number;
  query?: string;
  status?: Status;
  campaignId?: string;
}

function createSearchPattern(query?: string) {
  const normalized = query?.trim();
  return normalized ? `%${normalized}%` : undefined;
}

function createPageResult<Row>(
  rows: Row[],
  total: number,
  query: SubmissionListQuery<string>,
) {
  return {
    items: rows,
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

function pageOffset(query: SubmissionListQuery<string>) {
  return (query.page - 1) * query.pageSize;
}

export async function createContactSubmission(values: NewContactSubmission) {
  const [row] = await database.insert(contactSubmissions).values(values).returning();
  return row;
}

export async function upsertNewsletterSubscription(
  values: NewNewsletterSubscription,
) {
  const now = new Date();
  const [row] = await database
    .insert(newsletterSubscriptions)
    .values(values)
    .onConflictDoUpdate({
      target: newsletterSubscriptions.emailNormalized,
      set: {
        email: values.email,
        status: sql`case when ${newsletterSubscriptions.status} = 'suppressed'::newsletter_status then ${newsletterSubscriptions.status} else 'subscribed'::newsletter_status end`,
        source: values.source,
        unsubscribeTokenHash: sql`case when ${newsletterSubscriptions.status} = 'suppressed'::newsletter_status then ${newsletterSubscriptions.unsubscribeTokenHash} else ${values.unsubscribeTokenHash} end`,
        subscribedAt: sql`case when ${newsletterSubscriptions.status} = 'suppressed'::newsletter_status then ${newsletterSubscriptions.subscribedAt} else ${now} end`,
        unsubscribedAt: sql`case when ${newsletterSubscriptions.status} = 'suppressed'::newsletter_status then ${newsletterSubscriptions.unsubscribedAt} else null end`,
        updatedAt: now,
      },
    })
    .returning();
  return row;
}

export async function unsubscribeNewsletterByTokenHash(tokenHash: string) {
  const now = new Date();
  const [row] = await database
    .update(newsletterSubscriptions)
    .set({ status: "unsubscribed", unsubscribedAt: now, updatedAt: now })
    .where(eq(newsletterSubscriptions.unsubscribeTokenHash, tokenHash))
    .returning({ id: newsletterSubscriptions.id });
  return row ?? null;
}

export async function createCampaignSubmission(values: NewCampaignSubmission) {
  const [row] = await database.insert(campaignSubmissions).values(values).returning();
  return row;
}

type CampaignRow = typeof campaigns.$inferSelect;

interface CampaignSubmissionTransactionContext {
  campaign: CampaignRow | null;
  submissionCount: number;
  insert(values: NewCampaignSubmission): Promise<typeof campaignSubmissions.$inferSelect>;
}

export function withCampaignSubmissionLock<T>(
  campaignSlug: string,
  operation: (context: CampaignSubmissionTransactionContext) => Promise<T>,
) {
  return database.transaction(async (transaction) => {
    const [campaign] = await transaction
      .select()
      .from(campaigns)
      .where(
        and(
          sql`lower(${campaigns.slug}) = ${campaignSlug.toLowerCase()}`,
          isNull(campaigns.deletedAt),
        ),
      )
      .limit(1)
      .for("update");
    const [summary] = campaign
      ? await transaction
          .select({ total: count() })
          .from(campaignSubmissions)
          .where(eq(campaignSubmissions.campaignId, campaign.id))
      : [{ total: 0 }];

    return operation({
      campaign: campaign ?? null,
      submissionCount: summary?.total ?? 0,
      insert: async (values) => {
        const [row] = await transaction
          .insert(campaignSubmissions)
          .values(values)
          .returning();
        return row;
      },
    });
  });
}

export async function findContactSubmissionPage(
  query: SubmissionListQuery<SubmissionStatus>,
) {
  const pattern = createSearchPattern(query.query);
  const conditions: Array<SQL | undefined> = [
    query.status ? eq(contactSubmissions.status, query.status) : undefined,
    pattern
      ? or(
          ilike(contactSubmissions.fullName, pattern),
          ilike(contactSubmissions.email, pattern),
          ilike(contactSubmissions.company, pattern),
          ilike(contactSubmissions.collaborationType, pattern),
        )
      : undefined,
  ];
  const where = and(...conditions);
  const [rows, totals] = await Promise.all([
    database
      .select()
      .from(contactSubmissions)
      .where(where)
      .orderBy(desc(contactSubmissions.createdAt))
      .limit(query.pageSize)
      .offset(pageOffset(query)),
    database.select({ total: count() }).from(contactSubmissions).where(where),
  ]);
  return createPageResult(rows, totals[0]?.total ?? 0, query);
}

export async function findNewsletterSubscriptionPage(
  query: SubmissionListQuery<NewsletterStatus>,
) {
  const pattern = createSearchPattern(query.query);
  const where = and(
    query.status ? eq(newsletterSubscriptions.status, query.status) : undefined,
    pattern ? ilike(newsletterSubscriptions.email, pattern) : undefined,
  );
  const [rows, totals] = await Promise.all([
    database
      .select()
      .from(newsletterSubscriptions)
      .where(where)
      .orderBy(desc(newsletterSubscriptions.createdAt))
      .limit(query.pageSize)
      .offset(pageOffset(query)),
    database.select({ total: count() }).from(newsletterSubscriptions).where(where),
  ]);
  return createPageResult(rows, totals[0]?.total ?? 0, query);
}

export async function findCampaignSubmissionPage(
  query: SubmissionListQuery<SubmissionStatus>,
) {
  const pattern = createSearchPattern(query.query);
  const where = and(
    query.status ? eq(campaignSubmissions.status, query.status) : undefined,
    query.campaignId ? eq(campaignSubmissions.campaignId, query.campaignId) : undefined,
    pattern
      ? or(
          ilike(campaignSubmissions.fullName, pattern),
          ilike(campaignSubmissions.email, pattern),
          ilike(campaignSubmissions.socialUsername, pattern),
          ilike(campaigns.title, pattern),
        )
      : undefined,
  );
  const selection = {
    id: campaignSubmissions.id,
    campaignId: campaignSubmissions.campaignId,
    campaignTitle: campaigns.title,
    fullName: campaignSubmissions.fullName,
    email: campaignSubmissions.email,
    phone: campaignSubmissions.phone,
    followedPlatform: campaignSubmissions.followedPlatform,
    socialUsername: campaignSubmissions.socialUsername,
    notes: campaignSubmissions.notes,
    status: campaignSubmissions.status,
    source: campaignSubmissions.source,
    createdAt: campaignSubmissions.createdAt,
    updatedAt: campaignSubmissions.updatedAt,
  };
  const [rows, totals] = await Promise.all([
    database
      .select(selection)
      .from(campaignSubmissions)
      .innerJoin(campaigns, eq(campaignSubmissions.campaignId, campaigns.id))
      .where(where)
      .orderBy(desc(campaignSubmissions.createdAt))
      .limit(query.pageSize)
      .offset(pageOffset(query)),
    database
      .select({ total: count() })
      .from(campaignSubmissions)
      .innerJoin(campaigns, eq(campaignSubmissions.campaignId, campaigns.id))
      .where(where),
  ]);
  return createPageResult(rows, totals[0]?.total ?? 0, query);
}

export function findSubmissionCampaignOptions() {
  return database
    .select({ id: campaigns.id, title: campaigns.title })
    .from(campaigns)
    .orderBy(asc(campaigns.title));
}

async function writeStatusAudit(
  transaction: Parameters<Parameters<typeof database.transaction>[0]>[0],
  actorProfileId: string,
  entityType: string,
  entityId: string,
  beforeStatus: string,
  afterStatus: string,
) {
  await transaction.insert(auditLogs).values({
    actorProfileId,
    action: `${entityType}.status_update`,
    entityType,
    entityId,
    beforeData: { status: beforeStatus },
    afterData: { status: afterStatus },
  });
}

export function updateContactSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  actorProfileId: string,
) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction
      .select({ status: contactSubmissions.status })
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, id))
      .limit(1);
    if (!before) return null;
    const [row] = await transaction
      .update(contactSubmissions)
      .set({ status, updatedAt: new Date() })
      .where(eq(contactSubmissions.id, id))
      .returning();
    await writeStatusAudit(
      transaction,
      actorProfileId,
      "contact_submission",
      id,
      before.status,
      status,
    );
    return row;
  });
}

export function updateCampaignSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  actorProfileId: string,
) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction
      .select({ status: campaignSubmissions.status })
      .from(campaignSubmissions)
      .where(eq(campaignSubmissions.id, id))
      .limit(1);
    if (!before) return null;
    const [row] = await transaction
      .update(campaignSubmissions)
      .set({ status, updatedAt: new Date() })
      .where(eq(campaignSubmissions.id, id))
      .returning();
    await writeStatusAudit(
      transaction,
      actorProfileId,
      "campaign_submission",
      id,
      before.status,
      status,
    );
    return row;
  });
}

export function updateNewsletterSubscriptionStatus(
  id: string,
  status: NewsletterStatus,
  actorProfileId: string,
) {
  return database.transaction(async (transaction) => {
    const [before] = await transaction
      .select({ status: newsletterSubscriptions.status })
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.id, id))
      .limit(1);
    if (!before) return null;
    const now = new Date();
    const [row] = await transaction
      .update(newsletterSubscriptions)
      .set({
        status,
        unsubscribedAt: status === "unsubscribed" ? now : null,
        updatedAt: now,
      })
      .where(eq(newsletterSubscriptions.id, id))
      .returning();
    await writeStatusAudit(
      transaction,
      actorProfileId,
      "newsletter_subscription",
      id,
      before.status,
      status,
    );
    return row;
  });
}
