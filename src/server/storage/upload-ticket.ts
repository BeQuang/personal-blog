import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

import { ValidationError } from "@/server/errors";

import { imageMimeExtensions, isSafeImageObjectKey } from "./object-key";

const ticketPayloadSchema = z.object({
  expiresAt: z.number().int().positive(),
  mimeType: z.enum(Object.keys(imageMimeExtensions) as [keyof typeof imageMimeExtensions, ...(keyof typeof imageMimeExtensions)[]]),
  objectKey: z.string().refine(isSafeImageObjectKey, "Object key không hợp lệ"),
  originalFilename: z.string().min(1).max(255),
  purpose: z.enum([
    "avatar",
    "campaign_banner",
    "event_banner",
    "gallery",
    "post_cover",
    "post_thumbnail",
    "site_banner",
  ]),
  sizeBytes: z.number().int().positive().max(10 * 1024 * 1024),
  uploadedBy: z.uuid(),
});

export type UploadTicketPayload = z.infer<typeof ticketPayloadSchema>;

function getSigningSecret() {
  const secret = process.env.R2_SECRET_ACCESS_KEY;
  if (!secret) throw new Error("R2_SECRET_ACCESS_KEY is required");
  return secret;
}

function sign(encodedPayload: string) {
  return createHmac("sha256", getSigningSecret()).update(encodedPayload).digest("base64url");
}

export function createUploadTicket(payload: UploadTicketPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyUploadTicket(ticket: string) {
  const [encodedPayload, suppliedSignature, extra] = ticket.split(".");
  if (!encodedPayload || !suppliedSignature || extra) {
    throw new ValidationError("Upload ticket không hợp lệ");
  }

  const expectedSignature = sign(encodedPayload);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    throw new ValidationError("Upload ticket không hợp lệ");
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    throw new ValidationError("Upload ticket không hợp lệ");
  }

  const parsed = ticketPayloadSchema.safeParse(decoded);
  if (!parsed.success || parsed.data.expiresAt < Date.now()) {
    throw new ValidationError("Upload ticket đã háº¿t háº¡n hoáº·c không há»£p lá»‡");
  }
  return parsed.data;
}
