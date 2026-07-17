import "server-only";

import { z } from "zod";

import { ValidationError } from "@/server/errors";
import {
  mapCampaignSubmissionRow,
  mapContactSubmissionRow,
  mapNewsletterSubscriptionRow,
} from "@/server/mappers/submissions.mapper";

import { executeRepository } from "./service-helpers";

const emailSchema = z.email().transform((email) => email.trim().toLowerCase());
const phoneSchema = z
  .string()
  .trim()
  .regex(/^(?:\+84|0)\d{9,10}$/)
  .optional();

export const campaignSubmissionSchema = z.object({
  campaignId: z.uuid(),
  fullName: z.string().trim().min(2).max(120),
  email: emailSchema,
  phone: phoneSchema,
  followedPlatform: z.string().trim().max(80).optional(),
  socialUsername: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(1_000).optional(),
});

export const contactSubmissionSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: emailSchema,
  phone: phoneSchema,
  company: z.string().trim().max(160).optional(),
  collaborationType: z.string().trim().min(1).max(100),
  budgetRange: z.string().trim().max(100).optional(),
  message: z.string().trim().min(20).max(5_000),
});

export const newsletterSubscriptionSchema = z.object({ email: emailSchema });

export function validateSubmission<T>(schema: z.ZodType<T>, input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Submission validation failed", parsed.error.flatten().fieldErrors);
  }
  return parsed.data;
}

export async function getCampaignSubmissions(limit = 50) {
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission("submissions:view");
  const { findCampaignSubmissions } = await import("@/server/repositories/submissions.repository");
  return executeRepository(async () =>
    (await findCampaignSubmissions(limit)).map(mapCampaignSubmissionRow),
  );
}

export async function getContactSubmissions(limit = 50) {
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission("submissions:view");
  const { findContactSubmissions } = await import("@/server/repositories/submissions.repository");
  return executeRepository(async () =>
    (await findContactSubmissions(limit)).map(mapContactSubmissionRow),
  );
}

export async function getNewsletterSubscriptions(limit = 50) {
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission("submissions:view");
  const { findNewsletterSubscriptions } = await import("@/server/repositories/submissions.repository");
  return executeRepository(async () =>
    (await findNewsletterSubscriptions(limit)).map(mapNewsletterSubscriptionRow),
  );
}
