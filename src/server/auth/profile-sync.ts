import "server-only";

import type { User } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { database } from "@/server/database/client";
import { profiles } from "@/server/database/schema";

const userMetadataSchema = z.object({
  display_name: z.string().trim().min(1).optional(),
  full_name: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
});

function getDisplayName(user: User) {
  const metadata = userMetadataSchema.safeParse(user.user_metadata);
  const metadataName = metadata.success
    ? metadata.data.display_name ?? metadata.data.full_name ?? metadata.data.name
    : undefined;

  return metadataName ?? user.email?.split("@")[0] ?? "Admin user";
}

export async function syncAuthUserProfile(
  user: User,
  options: { recordLogin?: boolean } = {},
) {
  const now = new Date();
  const loginTimestamp = options.recordLogin ? now : undefined;
  const updateValues = {
    displayName: getDisplayName(user),
    email: user.email ?? null,
    updatedAt: now,
    ...(loginTimestamp ? { lastLoginAt: loginTimestamp } : {}),
  };

  const [profile] = await database
    .insert(profiles)
    .values({
      id: user.id,
      ...updateValues,
      lastLoginAt: loginTimestamp,
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: updateValues,
    })
    .returning();

  return profile;
}

export async function findProfileById(id: string) {
  const [profile] = await database
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);

  return profile ?? null;
}
