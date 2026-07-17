import "server-only";

import { z } from "zod";

import { siteConfig } from "@/config/site.config";
import { NotFoundError, ValidationError } from "@/server/errors";
import { mapSettingsRowToSiteConfig } from "@/server/mappers/settings.mapper";

import { getContentSource } from "./content-source";
import { executeRepository } from "./service-helpers";

const hexColorSchema = z.string().regex(/^#[0-9a-f]{6}$/i);
const settingsMutationSchema = z.object({
  siteName: z.string().trim().min(2).max(100),
  siteDescription: z.string().trim().min(10).max(300),
  creatorName: z.string().trim().min(2).max(100),
  username: z.string().trim().min(1).max(100),
  contactEmail: z.email(),
  defaultSeoTitle: z.string().trim().max(100).nullable().optional(),
  defaultSeoDescription: z.string().trim().max(300).nullable().optional(),
  theme: z.object({
    mode: z.enum(["light", "dark", "system"]),
    layout: z.enum(["creator", "minimal", "magazine"]),
    cardStyle: z.enum(["solid", "bordered", "glass", "minimal"]),
    buttonStyle: z.enum(["solid", "gradient", "outline", "pill"]),
    primaryColor: hexColorSchema,
    secondaryColor: hexColorSchema,
    accentColor: hexColorSchema,
    borderRadius: z.number().int().min(0).max(32),
  }),
});

export async function getSiteSettings() {
  if (getContentSource() === "mock") return { ...siteConfig };

  const { findSiteSettings } = await import("@/server/repositories/settings.repository");
  return executeRepository(async () => {
    const row = await findSiteSettings();
    if (!row) throw new NotFoundError("Site settings", "default");
    return mapSettingsRowToSiteConfig(
      row,
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    );
  });
}

export async function prepareSettingsMutation(input: unknown) {
  const { requireServicePermission } = await import("./service-authorization");
  await requireServicePermission("settings:manage");
  const parsed = settingsMutationSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Settings validation failed", parsed.error.flatten().fieldErrors);
  }
  return parsed.data;
}
